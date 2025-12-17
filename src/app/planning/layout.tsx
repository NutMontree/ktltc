export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="container">{children}</div>
    </section>
  );
}
