import GeneralMemo, { connectDB } from "@/app/models/GeneralMemo";
import GeneralMemoForm from "@/app/(components)/GeneralMemoForm";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { notFound } from "next/navigation";

const getMemoById = async (id) => {
  if (id === "new") return null;
  
  try {
    await connectDB();
    const memo = await GeneralMemo.findById(id);
    if (!memo) return null;
    return JSON.parse(JSON.stringify(memo));
  } catch (error) {
    console.error(error);
    return null;
  }
};

const EditGeneralMemoPage = async ({ params }) => {
  const { id } = await params;
  const memo = await getMemoById(id);

  if (id !== "new" && !memo) {
    notFound();
  }

  return (
    <>
      <Breadcrumb pageName={id === "new" ? "สร้างบันทึกข้อความใหม่" : "แก้ไขบันทึกข้อความ"} />
      <div className="mx-auto max-w-5xl">
        <GeneralMemoForm memoId={id} initialData={memo || {}} />
      </div>
    </>
  );
};

export default EditGeneralMemoPage;
