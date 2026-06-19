import InternalStep9Form from "@/app/(components)/InternalStep9Form";
import InternalStep9 from "@/app/models/InternalStep9";
import { connectDB } from "@/app/models/InternalPdca";

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep9.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step9Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep9Form projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step9Page;
