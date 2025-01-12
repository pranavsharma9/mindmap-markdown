import express from "express";
import { renderMarkmap } from "./markmapRenderer.js";
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();
const s3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region,
});

const app = express();
const PORT = 3001;

async function uploadToS3(bucketName, key, imageBuffer) {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: imageBuffer,
    ContentType: "image/png",
    // ACL: "public-read",
  };
  return s3.upload(params).promise();
}

app.use(express.json());

app.post("/generate-markmap", async (req, res) => {
  try {
    const { markup } = req.body;

    if (!markup) {
      return res.status(400).json({ message: "Markup is required" });
    }

    const imageBuffer = await renderMarkmap(markup);

    const s3BucketName = "mindmap-newsletter-bucket";
    const s3Key = `markmap-${Date.now()}.png`;
    const uploadResult = await uploadToS3(s3BucketName, s3Key, imageBuffer);
    res.status(200).json({
      message: "Markmap image successfully uploaded to S3",
      imageUrl: uploadResult.Location,
    });
  } catch (error) {
    console.error("Error generating Markmap:", error);
    res.status(500).json({
      message: "Failed to generate Markmap",
      error: error.message,
    });
  }
});

app.listen(PORT, "0.0.0.0",() => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
