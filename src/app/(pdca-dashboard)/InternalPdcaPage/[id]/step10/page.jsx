import InternalStep10Form from "@/app/(components)/InternalStep10Form";
import InternalStep10 from "@/app/models/InternalStep10";
import { connectDB } from "@/app/models/InternalPdca";

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep10.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step10Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep10Form projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step10Page;
