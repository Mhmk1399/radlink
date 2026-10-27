# MongoDB Atlas to VPS migration

The project now has a streaming, BSON-safe exporter and importer. It discovers collections from MongoDB itself, so it covers every Mongoose model and any collection not represented by a model. Canonical MongoDB Extended JSON preserves ObjectIds, dates, binary values, decimals, and other BSON types. The importer also recreates collection indexes.

## 1. Prepare a consistent cutover

Uploads in this project live in object storage and are not inside MongoDB. Migrate that storage separately if its provider is also changing.

For the final export, put the application in maintenance mode or stop it. The exporter reads collections independently, so writes during the export could make related collections represent slightly different points in time.

## 2. Export from Atlas

Allow the exporting machine's IP in Atlas Network Access and use an Atlas user with read access. The URI must contain the application database name:

```bash
SOURCE_MONGODB_URI='mongodb+srv://USER:PASSWORD@HOST/radlink?retryWrites=true&w=majority' npm run db:export
```

The default output is `mongo-export/`. Choose another location with:

```bash
SOURCE_MONGODB_URI='...' npm run db:export -- --out=/safe/path/radlink-export
```

To export every non-system database accessible to the Atlas user:

```bash
SOURCE_MONGODB_URI='...' npm run db:export -- --all-databases
```

Archive and upload the result:

```bash
tar -czf radlink-mongo-export.tar.gz mongo-export
```

Never commit the export. It contains production records, password hashes, and personal information.

## 3. Start MongoDB on the VPS

`docker-compose.yml` already defines MongoDB 7 with a persistent Docker volume. Set strong credentials in the VPS `.env`:

```dotenv
MONGO_INITDB_ROOT_USERNAME=radlink_admin
MONGO_INITDB_ROOT_PASSWORD=replace-with-a-long-random-password
MONGODB_URI=mongodb://radlink_admin:replace-with-a-long-random-password@mongo:27017/radlink?authSource=admin
```

Start and check MongoDB:

```bash
docker compose up -d mongo
docker compose ps mongo
```

## 4. Import on the VPS

Extract the archive in the repository, install dependencies, and import. Use `127.0.0.1` from the VPS host because Compose publishes port 27017:

```bash
tar -xzf radlink-mongo-export.tar.gz
npm ci
TARGET_MONGODB_URI='mongodb://radlink_admin:PASSWORD@127.0.0.1:27017/radlink?authSource=admin' npm run db:import
```

The importer refuses to write into a non-empty collection. For a deliberate retry that replaces the imported collections:

```bash
TARGET_MONGODB_URI='...' npm run db:import -- --drop-collections
```

This drops only collections present in the export, not the whole database. A single-database export can be imported under another database name with `--database=radlink`.

## 5. Cut over and verify

Point the app's `MONGODB_URI` to the Compose hostname `mongo`, then start it:

```bash
docker compose up -d --build
docker compose logs --tail=100 app
```

Test login and the main admin lists before reopening writes or changing DNS. Keep Atlas unchanged until the VPS copy is verified. The importer validates every data file's SHA-256 checksum and document count; application smoke tests are still necessary.
