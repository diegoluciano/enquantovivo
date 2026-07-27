import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const siteUrl = `${protocol}://${host}`;

  return {
    title: "Enquanto Vivo | Central de Marca",
    description: "Diretrizes, aplicações e arquivos oficiais da identidade visual do canal Enquanto Vivo.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Enquanto Vivo | Central de Marca",
      description: "Diretrizes, aplicações e arquivos oficiais da identidade visual do canal Enquanto Vivo.",
      type: "website",
      locale: "pt_BR",
      url: siteUrl,
      images: [{ url: `${siteUrl}/og-enquanto-vivo-2026.png`, width: 1200, height: 630, alt: "Enquanto Vivo — Central de Marca" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Enquanto Vivo | Central de Marca",
      description: "Diretrizes, aplicações e arquivos oficiais da identidade visual do canal Enquanto Vivo.",
      images: [`${siteUrl}/og-enquanto-vivo-2026.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
