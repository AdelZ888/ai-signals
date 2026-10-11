export function Box({ title, className, id, children }: { title: string; className?: string; id?: string; children: React.ReactNode }) {
  return (
    <section className={className ? `box ${className}` : "box"} id={id} aria-label={title}>
      <h2 className="box-title">{"// "}{title}</h2>
      {children}
    </section>
  );
}
