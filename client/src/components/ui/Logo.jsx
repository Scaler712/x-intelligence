export default function Logo({ className = '', showText = true, size = 'default' }) {
  const iconSize = size === 'small' ? 'w-6 h-6' : 'w-8 h-8';
  const textSize = size === 'small' ? 'text-sm' : 'text-base';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon - Isometric stacked diamond layers */}
      <div className={`${iconSize} relative`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Bottom layer (back) - partially visible, offset down and right */}
          <path
            d="M16 30L8 22L16 14L24 22L16 30Z"
            fill="white"
            opacity="0.25"
          />
          {/* Third layer - partially visible */}
          <path
            d="M16 26L10 20L16 14L22 20L16 26Z"
            fill="white"
            opacity="0.4"
          />
          {/* Second layer - partially visible */}
          <path
            d="M16 22L12 18L16 14L20 18L16 22Z"
            fill="white"
            opacity="0.6"
          />
          {/* Top layer (front) - fully visible */}
          <path
            d="M16 18L14 16L16 14L18 16L16 18Z"
            fill="white"
            opacity="1"
          />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-semibold text-white ${textSize} tracking-tight`}>
          XIntelligence
        </span>
      )}
    </div>
  );
}
