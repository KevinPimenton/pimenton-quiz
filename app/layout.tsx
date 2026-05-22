import type { Metadata } from "next";
import { Encode_Sans_Semi_Expanded, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const encodeSans = Encode_Sans_Semi_Expanded({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-encode-sans",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pimentón Quiz",
  description: "Quizzes en vivo para el equipo Pimentón",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${encodeSans.variable} ${sourceSans.variable}`}>
      <body className="font-body bg-cream text-ink antialiased">
        {children}
        <Toaster
          position="top-center"
          theme="light"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
