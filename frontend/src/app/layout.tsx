import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Urban Mobility Platform | Emission Reduction Dashboard",
  description: "AI-driven transportation optimization system to reduce traffic congestion, fuel consumption, and carbon emissions in urban areas with real-time monitoring and analytics.",
  keywords: "smart mobility, traffic, emissions, CO2, route optimization, urban transport, smart city",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
