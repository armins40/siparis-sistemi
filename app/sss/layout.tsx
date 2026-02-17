import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular',
  description: 'Siparis-Sistemi.com hakkında sıkça sorulan sorular ve cevapları.',
};

export default function SSSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
