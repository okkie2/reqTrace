import type { Metadata } from "next";
import "@picocss/pico/css/pico.min.css";
import "./tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "reqTrace Statement Manager",
  description: "MVP statement manager for traceable statements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
