import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Report — Afferent Signal' };
export default function CaptureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
