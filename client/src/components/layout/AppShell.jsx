export default function AppShell({ sidebar, children }) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {sidebar}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
