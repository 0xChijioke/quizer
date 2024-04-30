import "@rainbow-me/rainbowkit/styles.css";
import { getFrameMetadata } from "frog/next";
import { Metadata } from "next";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;
const imageUrl = `${baseUrl}/thumbnail.jpg`;

export async function generateMetadata(): Promise<Metadata> {
  const frameTags = await getFrameMetadata(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/quiz`);

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: "Quizer",
      template: "%s | Quizer",
    },
    description: "Built with 🏗 Scaffold-ETH 2",
    openGraph: {
      title: {
        default: "Quizer",
        template: "%s | Quizer",
      },
      description: "Built with 🏗 Scaffold-ETH 2",
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [imageUrl],
      title: {
        default: "Quizer",
        template: "%s | Quizer",
      },
      description: "Built with 🏗 Scaffold-ETH 2",
    },
    icons: {
      icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    },
    other: {      
      frameTags: Object.values(frameTags),
      'of:accepts:xmtp': '2024-02-01',
    } 
  }
}

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
