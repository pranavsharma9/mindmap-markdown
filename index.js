import express from "express";
import { renderMarkmap, renderMarkmapWithPlayButton } from "./markmapRenderer.js";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import { writeFile } from "node:fs/promises";

dotenv.config();
const s3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region,
});

const app = express();
const PORT = 3000;

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

async function saveToFile(imageBuffer, fileName) {
  const filePath = `./images/${fileName}.png`;
  await writeFile(filePath, imageBuffer);
}

app.use(express.json());

app.post("/generate-markmap", async (req, res) => {
  try {
    const { markup } = req.body;

    if (!markup) {
      return res.status(400).json({ message: "Markup is required" });
    }

    const imageBuffer = await renderMarkmap(markup);
    const imageBufferWithPlayButton = await renderMarkmapWithPlayButton(markup);

    const s3BucketName = "mindmap-newsletter-bucket";
    const s3Key = `markmap-${Date.now()}.png`;
    const uploadResult = await uploadToS3(s3BucketName, s3Key, imageBuffer);

    const s3KeyWithPlayButton = `markmap-with-play-button-${Date.now()}.png`;
    const uploadResultWithPlayButton = await uploadToS3(
      s3BucketName,
      s3KeyWithPlayButton,
      imageBufferWithPlayButton
    );
    res.status(200).json({
      message: "Markmap image with play button successfully uploaded to S3",
      imageUrl: uploadResult.Location,
      imageUrlWithPlayButton: uploadResultWithPlayButton.Location,
    });

    // await saveToFile(imageBuffer, "markmap.png");
    // await saveToFile(imageBufferWithPlayButton, "markmap-with-play-button.png");
    // res.status(200).json({
    //   message: "Markmap image successfully saved to file",
    // });
  } catch (error) {
    console.error("Error generating Markmap:", error);
    res.status(500).json({
      message: "Failed to generate Markmap",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
