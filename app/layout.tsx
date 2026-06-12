import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Калькулятор порцій",
  description: "Правило руки",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        {children}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
