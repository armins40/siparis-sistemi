export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login sayfası için özel layout - ana admin layout'unu bypass eder
  return <>{children}</>;
}
