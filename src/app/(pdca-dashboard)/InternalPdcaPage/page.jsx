export const dynamic = "force-dynamic";

import InternalPdca, { connectDB } from "@/app/models/InternalPdca";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import DeleteInternalPdca from "@/app/(components)/DeleteInternalPdca";

const getInternalPdcas = async () => {
  try {
    await connectDB();
    const data = await InternalPdca.find().sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    return [];
  }
};

const InternalPdcaDashboard = async () => {
  const pdcas = await getInternalPdcas();

  return (
    <>
      <Breadcrumb pageName="ระบบสร้างเอกสาร (11 ขั้นตอน)" />
      
      <div className="mb-6 flex justify-end">
        <Link
          href="/InternalPdcaPage/new"
          className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg hover:bg-opacity-90"
        >
          + เพิ่มเอกสารใหม่
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pdcas.map((item) => (
          <div
            key={item._id}
            className="rounded-2xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark"
          >
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                ปี {item.year}
              </span>
              <div className="flex gap-3">
                <Link
                  href={`/InternalPdcaPage/${item._id}`}
                  className="text-sm font-bold text-blue-500 hover:underline"
                >
                  แก้ไข
                </Link>
                <DeleteInternalPdca id={item._id} />
              </div>
            </div>
            <h3 className="mb-2 line-clamp-2 text-lg font-black text-black dark:text-white">
              {item.nameproject}
            </h3>
            <p className="mb-4 text-sm text-gray-500">{item.department}</p>

            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-xs text-gray-400">
                อัปเดตเมื่อ:{" "}
                {new Date(item.updatedAt).toLocaleDateString("th-TH")}
              </span>
              <div className="flex -space-x-2">
                {/* Progress or other indicators */}
              </div>
            </div>
          </div>
        ))}
        {pdcas.length === 0 && (
          <div className="col-span-full rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
            <p className="font-bold text-gray-400">ยังไม่มีข้อมูลเอกสารภายใน</p>
          </div>
        )}
      </div>
    </>
  );
};

export default InternalPdcaDashboard;
