import InternalMemoForm from "@/app/(components)/InternalMemoForm";
import InternalMemo from "@/app/models/InternalMemo";
import { connectDB } from "@/app/models/InternalPdca";

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalMemo.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step1Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalMemoForm projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step1Page;
