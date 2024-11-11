export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="static">{children}</div>
    </section>
  );
}
