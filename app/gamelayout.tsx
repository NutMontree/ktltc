export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="static">{children}</div>;
}
