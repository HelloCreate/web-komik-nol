import type { Metadata } from 'next';
import './globals.css';
import DisableRightClick from './DisableRightClick'; // Import komponen proteksi

export const metadata: Metadata = {
  title: 'Yanama Komik',
  description: 'Situs Baca Manhwa & Manga Favoritmu',
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