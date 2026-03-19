import type { Metadata } from "next";
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
