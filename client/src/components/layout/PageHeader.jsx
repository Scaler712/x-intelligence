export default function PageHeader({ breadcrumbs = [], title, subtitle }) {
  return (
    <div className="px-8 pt-8 pb-6">
      {/* Breadcrumb Bar */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6 font-light">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              <span className={index === breadcrumbs.length - 1 ? 'text-foreground' : 'text-muted-foreground'}>
                {crumb}
              </span>
              {index < breadcrumbs.length - 1 && (
                <span className="text-muted-foreground/50">/</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Page Title */}
      {title && (
        <h1 className="glass-heading text-3xl font-light mb-2 tracking-tight">
          {title}
        </h1>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="glass-subheading text-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
}
