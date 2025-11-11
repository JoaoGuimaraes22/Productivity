import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Tracker",
  description: "Track your daily routine with detailed insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-900">{children}</body>
    </html>
  );
}
