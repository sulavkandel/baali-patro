import './globals.css';

// Root layout is a pass-through; the real <html>/<body> live in
// app/[locale]/layout.tsx so that lang= and fonts are locale-aware.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
