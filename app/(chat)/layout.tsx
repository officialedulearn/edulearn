import { cookies } from "next/headers";
import Script from "next/script";
import { LayoutClient } from "./LayoutClient";

export const experimental_ppr = true;

// TODO: get the user from the connect wallet method auth()
//placeholder auth code todo: delete after the implementation of auth
async function auth() {
  return null;
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get("sidebar:state")?.value !== "true";

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <LayoutClient isCollapsed={isCollapsed}>{children}</LayoutClient>
    </>
  );
}
