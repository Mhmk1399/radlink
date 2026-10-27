import process from "node:process";
import mongodb from "mongodb";

const { MongoClient } = mongodb;
const argv = process.argv.slice(2);
const args = new Set(argv);
const option = (name) => argv.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3);

if (args.has("--help")) {
  console.log(`Usage: npm run db:replace-urls -- --database=NAME [--apply]
       [--from=OLD_BASE_URL] [--to=NEW_BASE_URL]

Environment:
  TARGET_MONGODB_URI  Destination MongoDB URI (falls back to MONGODB_URI)

The default mode is a read-only dry run. Pass --apply only during a maintenance
window to update matching strings recursively in every ordinary collection.`);
  process.exit(0);
}

const uri = process.env.TARGET_MONGODB_URI ?? process.env.MONGODB_URI;
const databaseName = option("database");
const from = option("from") ?? "https://storadge.arziplus.com";
const to = option("to") ?? "https://bucket.nfcrad.link";
const apply = args.has("--apply");

if (!uri) throw new Error("Set TARGET_MONGODB_URI (or MONGODB_URI).");
if (!databaseName) throw new Error("Pass the target explicitly with --database=NAME.");
if (!from || !to || from === to) throw new Error("The source and destination URL bases must be non-empty and different.");

const client = new MongoClient(uri, { appName: "radlink-url-migration" });

function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function replaceStrings(value, stats) {
  if (typeof value === "string") {
    if (!value.includes(from)) return value;
    const matches = value.split(from).length - 1;
    stats.strings += 1;
    stats.occurrences += matches;
    return value.replaceAll(from, to);
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      value[index] = replaceStrings(value[index], stats);
    }
    return value;
  }

  // Leave BSON values (ObjectId, Date, Decimal128, Binary, etc.) untouched.
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) value[key] = replaceStrings(value[key], stats);
  }
  return value;
}

async function flush(collection, operations) {
  if (!operations.length) return;
  await collection.bulkWrite(operations, { ordered: false });
  operations.length = 0;
}

async function processCollection(db, name) {
  const collection = db.collection(name);
  const operations = [];
  const totals = { documents: 0, strings: 0, occurrences: 0 };
  const examples = [];

  for await (const document of collection.find({}, { batchSize: 200 })) {
    const documentStats = { strings: 0, occurrences: 0 };
    replaceStrings(document, documentStats);
    if (!documentStats.occurrences) continue;

    totals.documents += 1;
    totals.strings += documentStats.strings;
    totals.occurrences += documentStats.occurrences;
    if (examples.length < 5) examples.push(String(document._id));

    if (apply) {
      operations.push({
        replaceOne: {
          filter: { _id: document._id },
          replacement: document,
        },
      });
      if (operations.length >= 200) await flush(collection, operations);
    }
  }
  if (apply) await flush(collection, operations);
  return { ...totals, examples };
}

async function countRemaining(db, names) {
  let remaining = 0;
  for (const name of names) {
    for await (const document of db.collection(name).find({}, { batchSize: 200 })) {
      const stats = { strings: 0, occurrences: 0 };
      replaceStrings(document, stats);
      remaining += stats.occurrences;
    }
  }
  return remaining;
}

try {
  await client.connect();
  const db = client.db(databaseName);
  const infos = await db.listCollections({}, { nameOnly: false }).toArray();
  const names = infos
    .filter((info) => info.type !== "view" && !info.name.startsWith("system."))
    .map((info) => info.name)
    .sort();

  console.log(`${apply ? "APPLY" : "DRY RUN"}: ${databaseName}`);
  console.log(`  from: ${from}`);
  console.log(`  to:   ${to}`);

  const grandTotal = { documents: 0, strings: 0, occurrences: 0 };
  for (const name of names) {
    const result = await processCollection(db, name);
    if (!result.occurrences) continue;
    grandTotal.documents += result.documents;
    grandTotal.strings += result.strings;
    grandTotal.occurrences += result.occurrences;
    console.log(
      `  ${name}: ${result.documents} documents, ${result.strings} strings, ${result.occurrences} occurrences`,
    );
    console.log(`    sample _id values: ${result.examples.join(", ")}`);
  }

  console.log(
    `Total: ${grandTotal.documents} documents, ${grandTotal.strings} strings, ${grandTotal.occurrences} occurrences`,
  );
  if (!apply) {
    console.log("Dry run only; no documents were changed. Re-run with --apply during maintenance.");
  } else {
    const remaining = await countRemaining(db, names);
    if (remaining) throw new Error(`Verification failed: ${remaining} old URL occurrences remain.`);
    console.log("Migration complete: verification found 0 old URL occurrences.");
  }
} catch (error) {
  console.error("URL migration failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
