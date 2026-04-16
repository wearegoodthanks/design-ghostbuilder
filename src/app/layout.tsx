import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://design.ghostbuilder.com"),
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  title: "Design Your Brand | Ghost Builder",
  description: "Turn your idea into a real brand. Professional designs and product mockups generated for free. Powered by the team behind $1B+ in streetwear.",
  openGraph: {
    title: "Design Your Brand | Ghost Builder",
    description: "Turn your idea into a real brand. Professional designs and product mockups generated for free.",
    url: "https://design.ghostbuilder.com",
    siteName: "Ghost Builder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Your Brand | Ghost Builder",
    description: "Turn your idea into a real brand. Professional designs and product mockups generated for free.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="bg-[#070707] text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
