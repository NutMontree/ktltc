// technicalcollegeorders
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="pt-8 pb-4 px-8">{children}</div>
    </section>
  );
}
