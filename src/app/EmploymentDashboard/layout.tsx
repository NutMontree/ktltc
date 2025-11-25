export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="pb-8 px-4">{children}</div>
    </section>
  );
}
