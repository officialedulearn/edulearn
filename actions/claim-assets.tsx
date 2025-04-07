"use server"
const eduManagerAddress = "0x9A6703004024059D6A8D88f2E4ceD67439809B71";
const nft = "0xb3F5231f310231544F0Aaa5Fa3016dfFF4d228E8"

import { ethers } from "ethers";
import eduManagerArtifact from "@/lib/artifacts/EduManagerAbi.json";
import {resetXP} from "@/lib/db/queries"

// Chain configuration
// export const eduChainTestnet = {
//   id: 656476,
//   name: "Edu Chain Testnet",
//   rpc: "https://open-campus-codex-sepolia.drpc.org",
//   nativeCurrency: {
//     name: "Open Campus",
//     symbol: "EDU",
//     decimals: 18,
//   }
// };

// Helper function to get signer
function getSigner() {
  if (!process.env.NEXT_PUBLIC_ACCOUNT_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is not set");
  }
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.open-campus-codex.gelato.digital"
  );
  // Make sure to trim any whitespace from the private key
  const privateKey = process.env.NEXT_PUBLIC_ACCOUNT_PRIVATE_KEY?.trim();
  console.log(privateKey)
  // Create wallet with private key
  const wallet = new ethers.Wallet(privateKey);
  // Connect wallet to provider
  const signer = wallet.connect(provider);
  return signer
}

// Helper function to get contract instance
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

    const resetUserXP = await resetXP(studentAddress)
    
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
  points: number,
  certUri: string
) {
  try {
    const signer = getSigner();
    const contract = getEduManagerContract(signer);
    
    // Convert to BigNumber
    const pointsBN = ethers.BigNumber.from(points);
    
    const tx = await contract.rewardAndCertify(
      studentAddress,
      pointsBN,
      certUri
    );
    const receipt = await tx.wait();
    
    console.log(`NFT certificate issued to student ${studentAddress}!`);
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    const resetUserXP = await resetXP(studentAddress)
    return receipt;
  } catch (error) {
    console.error("Error rewarding certificate:", error);
    throw error;
  }
}

// Example usage:
// 
// // Import the functions
// import { claimTokensForStudent, rewardCertificateToStudent } from './path-to-this-file';
//
// // Claim tokens
// await claimTokensForStudent("0xStudentAddress", 750);
// 
// // Reward certificate
// await rewardCertificateToStudent("0xStudentAddress", 1500, "ipfs://YOUR_IPFS_URI_HERE");