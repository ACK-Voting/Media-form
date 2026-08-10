import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";

// Served at media.ackmmc.com, which middleware rewrites to /media/*. Because
// the internal path is the same on both hosts, the title can be set here
// statically — no host sniffing needed.
export const metadata: Metadata = {
  title: "ACK Media Team",
  description: "ACK Mombasa Memorial Cathedral Media Team — registration and member portal",
};

export default function MediaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // AuthProvider is the media-team admin session. It lives here rather than in
  // the root layout so church-site visitors don't instantiate it at all.
  return <AuthProvider>{children}</AuthProvider>;
}
