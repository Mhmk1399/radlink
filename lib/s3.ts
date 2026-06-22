import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

type LiaraEnvName =
  | "LIARA_ENDPOINT"
  | "LIARA_ACCESS_KEY"
  | "LIARA_SECRET_KEY"
  | "LIARA_BUCKET_NAME";

function requireEnv(name: LiaraEnvName): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getLiaraEndpoint(): string {
  return requireEnv("LIARA_ENDPOINT").replace(/\/+$/, "");
}

export function getLiaraBucketName(): string {
  return requireEnv("LIARA_BUCKET_NAME");
}

export function createLiaraS3Client(): S3Client {
  return new S3Client({
    region: "default",
    endpoint: getLiaraEndpoint(),

    credentials: {
      accessKeyId: requireEnv("LIARA_ACCESS_KEY"),
      secretAccessKey: requireEnv("LIARA_SECRET_KEY"),
    },

    forcePathStyle: true,
    maxAttempts: 1,

    requestHandler: new NodeHttpHandler({
      connectionTimeout: 10_000,
      socketTimeout: 30_000,
    }),
  });
}