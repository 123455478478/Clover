import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = {
  title: "Clover ? Make lover closer",
  description: "Clover?????????????????????????????",
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
