import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { once } from "node:events";
import path from "node:path";
import process from "node:process";
import mongodb from "mongodb";

const { BSON: { EJSON }, MongoClient } = mongodb;

const argv = process.argv.slice(2);
const args = new Set(argv);
if (args.has("--help")) {
  console.log(`Usage: npm run db:export -- [--all-databases] [--out=PATH]

Environment:
  SOURCE_MONGODB_URI  Atlas URI (falls back to MONGODB_URI)
  MONGO_EXPORT_DIR    Output directory (default: mongo-export)`);
  process.exit(0);
}

const uri = process.env.SOURCE_MONGODB_URI ?? process.env.MONGODB_URI;
if (!uri) throw new Error("Set SOURCE_MONGODB_URI (or MONGODB_URI).");
const outArg = argv.find((arg) => arg.startsWith("--out="));
const outputRoot = path.resolve(outArg?.slice(6) || process.env.MONGO_EXPORT_DIR || "mongo-export");
const client = new MongoClient(uri, { appName: "radlink-migration-export" });
const encodedName = (value) => Buffer.from(value, "utf8").toString("base64url");

async function exportCollection(db, info, directory) {
  const file = `${encodedName(info.name)}.ndjson`;
  const stream = createWriteStream(path.join(directory, file), { encoding: "utf8", flags: "wx" });
  const hash = createHash("sha256");
  let documents = 0;
  try {
    // Atlas free/shared tiers reject noCursorTimeout cursors. Iteration keeps a
    // normal cursor active while batches are continuously being consumed.
    for await (const document of db.collection(info.name).find({}, { batchSize: 500 })) {
      const line = `${EJSON.stringify(document, { relaxed: false })}\n`;
      hash.update(line);
      if (!stream.write(line)) await once(stream, "drain");
      documents += 1;
    }
    stream.end();
    await once(stream, "finish");
  } catch (error) {
    stream.destroy();
    throw error;
  }
  const indexes = await db.collection(info.name).listIndexes().toArray();
  console.log(`  ${info.name}: ${documents} documents`);
  return { name: info.name, file, documents, sha256: hash.digest("hex"), options: info.options ?? {}, indexes };
}

async function exportDatabase(name) {
  const db = client.db(name);
  const directoryName = encodedName(name);
  const directory = path.join(outputRoot, directoryName);
  await mkdir(directory, { recursive: true });
  const infos = await db.listCollections({}, { nameOnly: false }).toArray();
  const collections = [];
  const skippedViews = [];
  console.log(`Exporting database ${name}`);
  for (const info of infos.sort((a, b) => a.name.localeCompare(b.name))) {
    if (info.type === "view") {
      skippedViews.push(info.name);
      console.warn(`  ${info.name}: skipped view`);
    } else {
      collections.push(await exportCollection(db, info, directory));
    }
  }
  return { name, directory: directoryName, collections, skippedViews };
}

try {
  await client.connect();
  let names;
  if (args.has("--all-databases")) {
    const result = await client.db("admin").admin().listDatabases({ nameOnly: true, authorizedDatabases: true });
    names = result.databases.map(({ name }) => name).filter((name) => !["admin", "config", "local"].includes(name));
  } else {
    const name = client.options.dbName;
    if (!name || name === "test") throw new Error("Include the application database name in the URI, or use --all-databases.");
    names = [name];
  }

  // A failed connection or URI validation may leave an empty directory from
  // an older version of this script. Reuse only an empty directory; never
  // overwrite or mix files with an existing backup.
  try {
    await mkdir(outputRoot);
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const entries = await readdir(outputRoot);
    if (entries.length > 0) {
      throw new Error(
        `Export directory is not empty: ${outputRoot}. Use --out=ANOTHER_PATH to preserve the existing backup.`,
      );
    }
  }

  const databases = [];
  for (const name of names) databases.push(await exportDatabase(name));
  const manifest = { format: "radlink-mongo-ejson-v1", createdAt: new Date(), databases };
  await writeFile(path.join(outputRoot, "manifest.ejson"), `${EJSON.stringify(manifest, { relaxed: false }, 2)}\n`, { flag: "wx" });
  console.log(`Export complete: ${outputRoot}`);
} catch (error) {
  console.error("Export failed:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
