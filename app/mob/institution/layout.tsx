import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Institution Dashboard - Kendraa Mobile',
  description: 'Healthcare Institution Management - Mobile Experience',
};

export default function MobileInstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
