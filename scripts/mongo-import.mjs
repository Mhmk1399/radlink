import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import path from "node:path";
import process from "node:process";
import mongodb from "mongodb";

const { BSON: { EJSON }, MongoClient } = mongodb;

const argv = process.argv.slice(2);
const args = new Set(argv);
if (args.has("--help")) {
  console.log(`Usage: npm run db:import -- [--from=PATH] [--drop-collections] [--database=NAME]

Environment:
  TARGET_MONGODB_URI  Destination URI (falls back to MONGODB_URI)
  MONGO_EXPORT_DIR    Export directory (default: mongo-export)`);
  process.exit(0);
}

const uri = process.env.TARGET_MONGODB_URI ?? process.env.MONGODB_URI;
if (!uri) throw new Error("Set TARGET_MONGODB_URI (or MONGODB_URI).");
const fromArg = argv.find((arg) => arg.startsWith("--from="));
const databaseArg = argv.find((arg) => arg.startsWith("--database="));
const inputRoot = path.resolve(fromArg?.slice(7) || process.env.MONGO_EXPORT_DIR || "mongo-export");
const databaseOverride = databaseArg?.slice(11);
const dropCollections = args.has("--drop-collections");
const client = new MongoClient(uri, { appName: "radlink-migration-import" });

function pick(source = {}, keys) {
  return Object.fromEntries(keys.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));
}

async function importCollection(db, databaseEntry, entry) {
  // Canonical EJSON parses manifest integers as BSON Int32/Long values.
  // Normalize metadata counters before comparing them with JS counters.
  const expectedDocuments = Number(entry.documents);
  if (!Number.isSafeInteger(expectedDocuments) || expectedDocuments < 0) {
    throw new Error(`Invalid document count in manifest for ${entry.name}.`);
  }

  const exists = await db.listCollections({ name: entry.name }, { nameOnly: true }).hasNext();
  if (exists && dropCollections) await db.collection(entry.name).drop();
  if (exists && !dropCollections) {
    const document = await db.collection(entry.name).findOne({}, { projection: { _id: 1 } });
    if (document) throw new Error(`${db.databaseName}.${entry.name} is not empty; use --drop-collections to replace it.`);
  }
  if (!exists || dropCollections) {
    await db.createCollection(entry.name, pick(entry.options, ["capped", "size", "max", "validator", "validationLevel", "validationAction", "storageEngine", "collation", "changeStreamPreAndPostImages", "clusteredIndex"]));
  }

  const input = createReadStream(path.join(inputRoot, databaseEntry.directory, entry.file));
  const lines = createInterface({ input, crlfDelay: Infinity });
  const hash = createHash("sha256");
  let batch = [];
  let inserted = 0;
  for await (const line of lines) {
    if (!line) continue;
    hash.update(`${line}\n`);
    batch.push(EJSON.parse(line, { relaxed: false }));
    if (batch.length === 500) {
      await db.collection(entry.name).insertMany(batch, { ordered: true });
      inserted += batch.length;
      batch = [];
    }
  }
  if (batch.length) {
    await db.collection(entry.name).insertMany(batch, { ordered: true });
    inserted += batch.length;
  }
  if (hash.digest("hex") !== entry.sha256) throw new Error(`Checksum mismatch for ${entry.name}.`);
  if (inserted !== expectedDocuments) throw new Error(`Count mismatch for ${entry.name}: expected ${expectedDocuments}, imported ${inserted}.`);

  for (const index of entry.indexes ?? []) {
    if (index.name === "_id_") continue;
    await db.collection(entry.name).createIndex(index.key, pick(index, ["name", "unique", "sparse", "expireAfterSeconds", "partialFilterExpression", "collation", "wildcardProjection", "hidden", "storageEngine"]));
  }
  console.log(`  ${entry.name}: ${inserted} documents`);
}

try {
  const manifest = EJSON.parse(await readFile(path.join(inputRoot, "manifest.ejson"), "utf8"), { relaxed: false });
  if (manifest.format !== "radlink-mongo-ejson-v1") throw new Error("Unsupported or invalid export format.");
  if (databaseOverride && manifest.databases.length !== 1) throw new Error("--database requires a single-database export.");
  await client.connect();
  for (const databaseEntry of manifest.databases) {
    const targetName = databaseOverride || databaseEntry.name;
    const db = client.db(targetName);
    console.log(`Importing ${databaseEntry.name} into ${targetName}`);
    for (const entry of databaseEntry.collections) await importCollection(db, databaseEntry, entry);
  }
  console.log("Import complete. Document counts and checksums match.");
} catch (error) {
  console.error("Import failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
