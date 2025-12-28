export default function Textarea({ className = '', rows = 4, ...props }) {
  return (
    <textarea
      className={`
        w-full px-4 py-3 min-h-[120px] resize-y
        bg-glass-background backdrop-blur-md
        border border-glass-border
        rounded-xl
        text-foreground text-sm font-light
        placeholder:text-muted-foreground
        focus:outline-none focus:border-ring focus:bg-foreground/5
        transition-none
        ${className}
      `}
      rows={rows}
      {...props}
    />
  );
}
