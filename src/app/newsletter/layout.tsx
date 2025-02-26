export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div
        className="container py-8"
      >{children}</div>
    </section>
  );
}
