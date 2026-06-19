import InternalStep20Form from "@/app/(components)/InternalStep20Form";
import InternalStep20 from "@/app/models/InternalStep20";
import { connectDB } from "@/app/models/InternalPdca";

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep20.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step20Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep20Form projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step20Page;
