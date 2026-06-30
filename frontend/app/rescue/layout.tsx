import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Rescue — Afferent Signal' };
export default function RescueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
