export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="flex justify-center">
      </div>
      <div className="container py-12">
        {children}.
      </div>
    </section>
  );
}
