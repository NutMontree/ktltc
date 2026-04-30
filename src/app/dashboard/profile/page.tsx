"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FullPageLoader from "@/components/FullPageLoader";

export default function ProfileRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // ถ้าสถานะคือ authenticated และมี id ให้พาไปที่หน้าโปรไฟล์ทันที
    if (status === "authenticated" && (session?.user as any)?.id) {
      router.replace(`/dashboard/profile/${(session.user as any).id}`);
      return;
    }

    // ถ้าสถานะคือ unauthenticated ให้รอสักครู่ก่อน redirect (เผื่อเป็นสถานะชั่วคราวขณะโหลด)
    if (status === "unauthenticated") {
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, status, router]);

  return <FullPageLoader message="กำลังไปที่โปรไฟล์ของคุณ..." />;
}
