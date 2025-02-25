export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div
        className="container pt-8"
      >{children}</div>
    </section>
  );
}
