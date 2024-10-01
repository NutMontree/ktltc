// newsletter
export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="px-8 py-8">{children}</div>
    </section>
  );
}
