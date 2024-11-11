export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="py-32">{children}</div>
    </section>
  );
}
