export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`
        w-full px-4 py-3 
        bg-[#1a1a1a] backdrop-blur-md
        border border-[#2a2a2a]
        rounded-xl
        text-white text-sm font-light
        placeholder:text-[#666666]
        focus:outline-none focus:border-[#2563eb] focus:bg-[#252525]
        transition-none
        ${className}
      `}
      {...props}
    />
  );
}
