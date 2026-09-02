import { Comfortaa, Inter, IBM_Plex_Mono } from 'next/font/google'
import "./globals.css";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-data",
});

export const metadata = {
  title: "Pageviz",
  description: "Every visit, one clean signal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${comfortaa.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}