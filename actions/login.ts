"use server";
import { VerifyLoginPayloadParams, createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { client } from "@/lib/client";
import { cookies } from "next/headers";
import { createUser, getUser as getUserFromDB } from "@/lib/db/queries";

const privateKey = process.env.NEXT_PUBLIC_AUTH_PRIVATE_KEY || "";

if (!privateKey) {
  throw new Error("Missing AUTH_PRIVATE_KEY in .env file.");
}

const thirdwebAuth = createAuth({
  domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || "",
  adminAccount: privateKeyToAccount({ client, privateKey }),
  client: client,
});

export const generatePayload = thirdwebAuth.generatePayload;

export async function login(payload: VerifyLoginPayloadParams) {
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
  if (verifiedPayload.valid) {
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });
    (await cookies()).set("jwt", jwt);
  }
  const existingUser = await getUserFromDB(payload.payload.address);
  if (!existingUser.length) {
    await createUser(payload.payload.address);
  }
}

export async function isLoggedIn() {
  const jwt = (await cookies()).get("jwt");
  if (!jwt?.value) {
    return false;
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
  return authResult.valid;
}

export async function logout() {
  (await cookies()).delete("jwt");
}

export async function getUser() {
  const jwt = (await cookies()).get("jwt");
  if (!jwt?.value) {
    return null;
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });

  if (authResult.valid) {
    return authResult.parsedJWT;
  }

  return null;
}

export async function getUserFromDetails(address:string) {
  try {
    const user = await getUserFromDB(address);  
    return user[0];
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
    
  }
}