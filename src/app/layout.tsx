// src/app/layout.tsx
import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brava - Maquillaje y Belleza",
  description: "Descubre la colección de maquillaje y productos de belleza de Brava.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Tailwind CSS CDN - Si ya lo tienes configurado con PostCSS, esto no es estrictamente necesario aquí */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-100`}>
        {/* AuthProvider debe envolver toda la aplicación para que el contexto esté disponible */}
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}