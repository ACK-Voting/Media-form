import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import ContentBootstrap from "@/components/ContentBootstrap";
import { getServerContent } from "@/lib/serverContent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// The church website is now what lives at the root. The media-team app
// overrides this from app/media/layout.tsx, and the CMS from app/cms/layout.tsx.
export const metadata: Metadata = {
  title: "ACK Mombasa Memorial Cathedral",
  description:
    "ACK Mombasa Memorial Cathedral — the mother church of the Diocese of Mombasa, serving the coastal region of Kenya since 1903.",
  icons: {
    icon: "/logo_1.jpeg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetched on the server so pages are rendered with the live CMS copy. Without
  // this the HTML would carry the bundled fallback, which is what search
  // engines and link previews would see.
  const content = await getServerContent();

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        <ToastProvider>
          {/* Must precede children: it fills the stores during render. */}
          <ContentBootstrap initial={content} />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
