"use server";
const eduManagerAddress = "0x196D01f8060Dc3975032c99ed0e21f5AC55C8523";

import { ethers } from "ethers";
import eduManagerArtifact from "@/lib/artifacts/EduManagerAbi.json";
import { resetXP } from "@/lib/db/queries";

// // Chain configuration
// const eduChainTestnet = {
//   id: 656476,
//   name: "Edu Chain Testnet",
//   rpc: "https://open-campus-codex-sepolia.drpc.org",
//   nativeCurrency: {
//     name: "Open Campus",
//     symbol: "EDU",
//     decimals: 18,
//   },
// };

function getSigner() {
  if (!process.env.NEXT_PUBLIC_ACCOUNT_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is not set");
  }

  const customNetwork = {
    chainId: 656476,
    name: "edu-chain-testnet",
  };

  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.open-campus-codex.gelato.digital"
  );

  const privateKey = process.env.NEXT_PUBLIC_ACCOUNT_PRIVATE_KEY?.trim();
  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider);
  return signer;
}
function getEduManagerContract(signerOrProvider: any) {
  return new ethers.Contract(
    eduManagerAddress,
    eduManagerArtifact.output.abi,
    signerOrProvider
  );
}

/**
 * Claims tokens for a student based on points earned
 * @param studentAddress Wallet address of the student
 * @param points Number of points to convert to tokens
 * @returns Transaction receipt
 */
export async function claimTokensForStudent(
  studentAddress: string,
  points: number
) {
  try {
    const signer = getSigner();
    const contract = getEduManagerContract(signer);

    // Convert to BigNumber
    const pointsBN = ethers.BigNumber.from(points);

    const tx = await contract.claimTokens(studentAddress, pointsBN, {
      gasLimit: 50000000, // Use a safe upper bound
    });
    const receipt = await tx.wait();
    const resetUserXP = await resetXP(studentAddress);

    console.log(`Tokens claimed for student ${studentAddress}!`);
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    return receipt;
  } catch (error) {
    console.error("Error claiming tokens:", error);
    throw error;
  }
}

/**
 * Rewards a student with an NFT certificate
 * @param studentAddress Wallet address of the student
 * @param points Points associated with the certificate
 * @param certUri IPFS URI for the certificate metadata
 * @returns Transaction receipt
 */
export async function rewardCertificateToStudent(
  studentAddress: string,
  points: number
) {
  try {
    const signer = getSigner();
    const contract = getEduManagerContract(signer);

    // Convert to BigNumber
    const pointsBN = ethers.BigNumber.from(points);

     const tx = await contract.rewardAndCertify(studentAddress, pointsBN);
     const receipt = await tx.wait();

    console.log(`NFT certificate issued to student ${studentAddress}!`);
     console.log(`Transaction hash: ${receipt.transactionHash}`);
    const resetUserXP = await resetXP(studentAddress);
    return receipt
  } catch (error) {
    console.error("Error rewarding certificate:", error);
    throw error;
  }
}
