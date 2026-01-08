export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f7f9" }}>
        <header style={{ padding: 16, background: "#111", color: "#fff" }}>
          Dashboard
        </header>
  
        <main style={{ padding: 24 }}>
          {children}
        </main>
      </div>
    );
  }
  