import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./providers/auth";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestão Municipal - Pacajus",
  description: "Sistema de Gestão Municipal de Pacajus - CE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-theme="pacajusTheme">
      <body className={`${inter.className} min-h-screen flex flex-col bg-base-200`}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8 flex-1 mt-14">
            {children}
          </main>
          <Footer />
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
