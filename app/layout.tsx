import type { Metadata } from 'next';
import './globals.css';
import DisableRightClick from './DisableRightClick'; // Import komponen proteksi

export const metadata: Metadata = {
  title: 'Yanama Komik',
  description: 'Situs Baca Manhwa & Manga Favoritmu',
  verification: {
    google: '<meta name="google-site-verification" content="2sh6TfX8aeQyi_A7jjgGp8no0PnyNS5OL5gwhD9I9v0" />'
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="select-none bg-gray-950 text-white">
        {/* Komponen Proteksi Global */}
        <DisableRightClick />
        {children}
      </body>
    </html>
  );
}