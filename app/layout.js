import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = {
  title: "Clover · Make lover closer",
  description: "Clover，让相爱的人更靠近。把想一起做的事，变成以后会微笑的回忆。",
  manifest: `${basePath}/manifest.webmanifest`,
  icons: { icon: `${basePath}/logo.svg`, apple: `${basePath}/logo.svg` },
  appleWebApp: { capable: true, title: "Clover", statusBarStyle: "default" }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F7F4EF"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
