export default function Card({ children, className = '', maxWidth = '', ...props }) {
  return (
    <section className={`w-full px-8 pb-10 ${maxWidth}`}>
      <div
        className={`${className}`}
        {...props}
      >
        {children}
      </div>
    </section>
  );
}
