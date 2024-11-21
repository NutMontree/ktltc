export default function PressReleaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}
