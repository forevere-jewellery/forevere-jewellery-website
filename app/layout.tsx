import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthContext";
import { CartProvider } from "@/components/cart/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthModal } from "@/components/auth/AuthModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Chatbot } from "@/components/ui/Chatbot";
import { CookieConsent } from "@/components/ui/CookieConsent";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Forevere Jewellary | Premium Fine Jewelry & Diamonds",
  description: "Discover handcrafted luxury jewelry, solitaire diamond rings, gold necklaces, drop earrings, and bracelets at Forevere Jewellary.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FDFBF7] text-[#111111] font-sans selection:bg-[#C5A059] selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <AuthModal />
              <CartDrawer />
              <Chatbot />
              <CookieConsent />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
