// import Breadcrumb from "@/components/Common/Breadcrumb";
// import Link from "next/link";


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="flex justify-center">
        {/* <Breadcrumb pageName="PressRelease Page" /> */}
      </div>
      <div className="container py-12">
        {children}.
      </div>
    </section>
  );
}
