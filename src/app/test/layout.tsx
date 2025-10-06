export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div
        className="container"
      >{children}</div>
    </section>
  );
}
    // px-4 py-4
    //   lg:px-12  
    //   sm:px-12  