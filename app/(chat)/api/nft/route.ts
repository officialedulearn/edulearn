// pages/api/nft.ts
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userAddress, points } = req.body;
    if (!userAddress || !points) return res.status(400).json({ error: "Missing data" });

    const width = 600, height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const background = await loadImage("https://i.imgur.com/WohnxXF.png");
    ctx.drawImage(background, 0, 0, width, height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "30px Arial";
    ctx.fillText(`User: ${userAddress.substring(0, 6)}...`, 50, 100);
    ctx.fillText(`Points: ${points}`, 50, 150);

    const filePath = path.join(process.cwd(), "public", `${userAddress}.png`);
    const out = fs.createWriteStream(filePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on("finish", async () => {
      try {
        const imgData = fs.createReadStream(filePath);
        const pinataResponse = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          imgData,
          {
            headers: {
              pinata_api_key: process.env.PINATA_API_KEY!,
              pinata_secret_api_key: process.env.PINATA_SECRET_KEY!,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        fs.unlinkSync(filePath);

        const metadata = {
          name: "EDU Points NFT",
          description: `An NFT representing ${points} points for ${userAddress}`,
          image: `ipfs://${pinataResponse.data.IpfsHash}`,
        };

        const metadataUpload = await axios.post(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          metadata,
          {
            headers: {
              pinata_api_key: process.env.PINATA_API_KEY!,
              pinata_secret_api_key: process.env.PINATA_SECRET_KEY!,
            },
          }
        );

        return res.status(200).json({ metadataURI: `ipfs://${metadataUpload.data.IpfsHash}` });
      } catch (uploadErr) {
        console.error("Upload Error:", uploadErr);
        return res.status(500).json({ error: "Failed to upload to Pinata" });
      }
    });
  } catch (err) {
    console.error("NFT generation error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
