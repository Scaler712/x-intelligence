export default function Button({
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  ...props
}) {
  const baseClasses = 'relative inline-flex items-center justify-center font-light tracking-tight transition-none';
  
  const variants = {
    primary: 'bg-glass-background backdrop-blur-md border border-glass-border text-foreground hover:bg-foreground/10',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    danger: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 rounded-xl',
    sm: 'h-9 rounded-lg px-3 text-sm',
    lg: 'h-11 rounded-xl px-8',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
