import "./globals.css";

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
      <body>{children}
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </body>
    </html>
  );
}
