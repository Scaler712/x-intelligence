export default function FormField({ label, optional = false, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="text-xs font-light uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        {optional && (
          <span className="px-2 py-0.5 text-xs font-light bg-glass-background border border-glass-border rounded-md text-muted-foreground">
            Optional
          </span>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
