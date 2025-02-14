export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="px-2 py-2 md:px-8 md:py-8">{children}</div>
    </section>
  );
}
