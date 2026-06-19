import InternalStep21Form from "@/app/(components)/InternalStep21Form";
import InternalStep21 from "@/app/models/InternalStep21";
import { connectDB } from "@/app/models/InternalPdca";

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep21.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step21Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep21Form projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step21Page;
