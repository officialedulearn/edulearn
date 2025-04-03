import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export  async function POST(req: NextRequest) {

    try {
        const { userAddress, points } = await req.json();

        // 1️⃣ Call API to generate NFT image
        const imageResponse = await fetch("http://localhost:3000/api/generateNFTImage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userAddress, points }),
        });

        const imageData = await imageResponse.json();
        if (!imageData.imageURI) return NextResponse.json({ error: "Image upload failed" }, {status: 400});

        // 2️⃣ Create metadata with the IPFS image URL
        const metadata = {
            name: "EDU Points NFT",
            description: `An NFT representing ${points} points for ${userAddress}`,
            image: imageData.imageURI,
        };

        // 3️⃣ Upload metadata to Pinata
        const pinataResponse = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            metadata,
            {
                headers: {
                    pinata_api_key: process.env.PINATA_API_KEY,
                    pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
                },
            }
        );

        NextResponse.json({ metadataURI: `ipfs://${pinataResponse.data.IpfsHash}` }, {status: 400});

    } catch (error) {
        console.error("Error uploading metadata:", error);
        NextResponse.json({ error: "Failed to upload metadata" }, {status: 400});
    }
}
