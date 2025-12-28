export default function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`
        w-full px-4 py-3 pr-10
        bg-glass-background backdrop-blur-md
        border border-glass-border
        rounded-xl
        text-foreground text-sm font-light
        focus:outline-none focus:border-ring focus:bg-foreground/5
        transition-none
        appearance-none
        bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")] bg-no-repeat bg-right-4 bg-center
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
}
