import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "SGS - Sistema de Gestión de Socios",
  description: "Platform for managing members and resources in community associations",
};

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen bg-background-light">
            {children}

          </div>
        </Providers>
      </body>
    </html>
  );
}
