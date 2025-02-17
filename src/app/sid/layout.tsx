export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="px-2 md:px-8 md:py-8 pt-28 pb-4">{children}</div>
    </section>
  );
}
