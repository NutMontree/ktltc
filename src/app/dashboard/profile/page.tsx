"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FullPageLoader from "@/components/FullPageLoader";

export default function ProfileRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.id) {
      router.replace(`/dashboard/profile/${(session.user as any).id}`);
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, session, router]);

  return <FullPageLoader message="กำลังไปที่โปรไฟล์ของคุณ..." />;
}
