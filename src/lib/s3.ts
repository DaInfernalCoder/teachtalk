import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export async function uploadToS3(file: File) {
  const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_S3_REGION!,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
    },
  });

  const file_key =
    "uploads/" + Date.now().toString() + file.name.replace(/ /g, "-");

  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: file_key,
    Body: file,
  };

  try {
    const upload = new Upload({
      client: s3Client,
      params,
    });

    upload.on("httpUploadProgress", (progress) => {
      if (progress.loaded && progress.total) {
        const percentage = Math.round((progress.loaded * 100) / progress.total);
        console.log(`Uploading to S3... ${percentage}%`);
      }
    });

    const data = await upload.done();
    console.log("Success", data);
    console.log("File uploaded successfully", file_key);

    return {
      file_key,
      file_name: file.name,
    };
  } catch (err) {
    console.error("Error", err);
    throw err;
  }
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${file_key}`;
  return url;
}
