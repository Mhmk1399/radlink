import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import {
  createLiaraS3Client,
  getLiaraBucketName,
  getLiaraEndpoint,
} from "@/lib/s3";

function encodeObjectKey(key: string) {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function buildLiaraPublicUrl(key: string) {
  const configuredBase =
    process.env.LIARA_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_LIARA_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    "";

  if (configuredBase) {
    return `${configuredBase.replace(/\/+$/, "")}/${encodeObjectKey(key)}`;
  }

  const bucketName = getLiaraBucketName();
  const endpointUrl = new URL(getLiaraEndpoint());
  const hostname = endpointUrl.hostname.startsWith(`${bucketName}.`)
    ? endpointUrl.hostname
    : `${bucketName}.${endpointUrl.hostname}`;

  return `${endpointUrl.protocol}//${hostname}${
    endpointUrl.port ? `:${endpointUrl.port}` : ""
  }/${encodeObjectKey(key)}`;
}

export async function uploadLiaraObject({
  key,
  body,
  contentType,
  metadata,
  cacheControl,
}: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
}) {
  const input: PutObjectCommandInput = {
    Bucket: getLiaraBucketName(),
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
    CacheControl: cacheControl,
  };

  const result = await createLiaraS3Client().send(new PutObjectCommand(input));

  return {
    key,
    url: buildLiaraPublicUrl(key),
    etag: result.ETag,
  };
}

export async function deleteLiaraObject(key: string) {
  await createLiaraS3Client().send(
    new DeleteObjectCommand({
      Bucket: getLiaraBucketName(),
      Key: key,
    }),
  );
}
