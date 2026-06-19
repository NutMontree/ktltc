export const dynamic = "force-dynamic";

import GeneralMemo, { connectDB } from "@/app/models/GeneralMemo";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DeletePdca from "@/app/(components)/DeletePdca";
import { auth } from "@/auth";

const getGeneralMemos = async () => {
  try {
    await connectDB();
    const data = await GeneralMemo.find().sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    return [];
  }
};

const GeneralMemoDashboard = async () => {
  const memos = await getGeneralMemos();
  const session = await auth();
  const currentUser = session?.user;

  return (
    <>
      <Breadcrumb pageName="ระบบสร้างเอกสารบันทึกข้อความ" />
      
      <div className="mb-6 flex justify-end">
        <Link
          href="/GeneralMemoPage/new"
          className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg hover:bg-opacity-90 transition"
        >
          + สร้างบันทึกข้อความใหม่
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {memos.map((item) => {
          const isOwner = currentUser?.id && item.userId === currentUser.id;
          const adminRoles = ["super_admin"];
          const isAdmin = currentUser?.role && adminRoles.includes(currentUser.role.toLowerCase());
          const canEdit = isOwner || isAdmin || !item.userId; // If no userId, it's public/legacy

          return (
            <div
              key={item._id}
              className="rounded-2xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark"
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {item.department || "วิทยาลัยเทคนิคกันทรลักษ์"}
                </span>
                
                {canEdit && (
                  <div className="flex gap-3">
                    <Link
                      href={`/GeneralMemoPage/${item._id}`}
                      className="text-sm font-bold text-blue-500 hover:underline"
                    >
                      แก้ไข
                    </Link>
                    <DeletePdca id={item._id} type="general" />
                  </div>
                )}
              </div>
              
              <h3 className="mb-2 line-clamp-2 text-lg font-black text-black dark:text-white" title={item.subject}>
                {item.subject || "(ไม่มีชื่อเรื่อง)"}
              </h3>
              
              <p className="mb-4 text-sm text-gray-500 line-clamp-1">
                เรียน: {item.salutation}
              </p>

              {item.authorName && (
                <div className="mb-4 flex items-center gap-2">
                  {item.authorImage ? (
                    <img src={item.authorImage} alt={item.authorName} className="h-6 w-6 rounded-full" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {item.authorName.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs text-gray-500">สร้างโดย: {item.authorName}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-xs text-gray-400">
                  อัปเดตเมื่อ: {new Date(item.updatedAt).toLocaleDateString("th-TH")}
                </span>
              </div>
            </div>
          );
        })}
        
        {memos.length === 0 && (
          <div className="col-span-full rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
            <p className="font-bold text-gray-400">ยังไม่มีข้อมูลบันทึกข้อความ</p>
          </div>
        )}
      </div>
    </>
  );
};

export default GeneralMemoDashboard;
