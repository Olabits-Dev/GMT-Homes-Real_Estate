import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "GMT Homes",
    template: "%s | GMT Homes",
  },
  description:
    "GMT Homes. We drive to excellence, giving you the best always....!!!! Browse standout homes for rent, sale, and investment opportunities.",
  metadataBase: new URL("https://gmthomes.example"),
  openGraph: {
    description:
      "GMT Homes. We drive to excellence, giving you the best always....!!!! Explore featured homes, trusted listings, and investment opportunities.",
    title: "GMT Homes",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewerPromise = getCurrentUser();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell viewerPromise={viewerPromise}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

async function AppShell({
  children,
  viewerPromise,
}: {
  children: React.ReactNode;
  viewerPromise: ReturnType<typeof getCurrentUser>;
}) {
  const viewer = await viewerPromise;

  return (
    <AppProviders viewerId={viewer?.id ?? null}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader viewer={viewer} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </AppProviders>
  );
}
