import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Free Brand Design Tool | Ghost Builder",
  description: "Design your brand in 60 seconds. Free AI-generated designs and mockups. No designers. No upfront costs.",
  openGraph: {
    title: "Design Your Brand Free | Ghost Builder",
    description: "Generate professional designs and product mockups for your brand in under 60 seconds.",
    images: ["/og-image.png"],
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
