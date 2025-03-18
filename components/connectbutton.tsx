// app/page.tsx
import type { NextPage } from "next";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/client";
import {
  generatePayload,
  isLoggedIn,
  login,
  logout,
} from "@/actions/login"; 
import { defineChain } from "thirdweb";

const CustomConnectButton = () => {
  return (
    <ConnectButton
      client={client}
      chain={defineChain(656476)}
      auth={{
        isLoggedIn: async (address) => {
          console.log("checking if logged in!", { address });
          return await isLoggedIn();
        },
        doLogin: async (params) => {
          console.log("logging in!");
          await login(params);
        },
        getLoginPayload: async ({ address }) =>
          generatePayload({ address }),
        doLogout: async () => {
          console.log("logging out!");
          await logout();
        },
      }}
    />
  );
};

export default CustomConnectButton;
