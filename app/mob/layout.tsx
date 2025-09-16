import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kendraa Mobile',
  description: 'Healthcare Professional Network - Mobile Experience',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
