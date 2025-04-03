import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    try {
        const body = await req.json()
        const { userAddress, points } = body;
        if (!userAddress || !points) return NextResponse.json({ error: "Missing data" }, { status: 400 });

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
            // Upload image to Pinata
            const imgData = fs.createReadStream(filePath);
            const pinataResponse = await axios.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                imgData,
                {
                    headers: {
                        pinata_api_key: process.env.PINATA_API_KEY,
                        pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
                    },
                }
            );

            // Delete local image
            fs.unlinkSync(filePath);

            return NextResponse.json({ imageURI: `ipfs://${pinataResponse.data.IpfsHash}` }, { status: 200 });
        });

    } catch (error) {
        console.error("Error generating NFT image:", error);
        return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }
}
