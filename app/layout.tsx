import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./providers/auth";
import { Navbar } from "@/app/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestão Municipal - Pacajus",
  description: "Sistema de Gestão Municipal de Pacajus - CE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="pacajusTheme">
      <body className={`${inter.className} bg-base-200 text-base-content`}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            theme="colored"
          />
        </AuthProvider>
      </body>
    </html>
  );
}
