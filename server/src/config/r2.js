//server/src/config/r2.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

async function uploadToR2(file, folder = "products") {
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `${folder}/${Date.now()}-${safeName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
}

module.exports = { uploadToR2 };
