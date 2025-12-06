import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ToastContainer } from "@/components/ui/toast";
import { Player } from "@/components/music/player";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Productivity App",
  description: "Personal productivity application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Sidebar />
          <div className="md:pl-64 min-h-screen transition-[padding] duration-200">
            {children}
          </div>
          <Player />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}

