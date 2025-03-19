import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { isLoggedIn, getUser as getWeb3User } from "@/actions/login";
import { AdapterUser } from "next-auth/adapters";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [],
  callbacks: {
    async jwt({ token }: { token: JWT }) {
      if (!token.sub) {
        const web3LoggedIn = await isLoggedIn();
        if (web3LoggedIn) {
          const web3User = await getWeb3User();
          if (web3User) {
            token.sub = web3User.sub; 
          }
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (!session.user) {
        session.user = {} as AdapterUser;
      }

      if (token.sub) {
        session.user.id = token.sub; 
      }

      return session;
    },
  },
});
