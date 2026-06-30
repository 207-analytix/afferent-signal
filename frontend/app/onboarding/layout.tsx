import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Get started — Afferent Signal' };
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
