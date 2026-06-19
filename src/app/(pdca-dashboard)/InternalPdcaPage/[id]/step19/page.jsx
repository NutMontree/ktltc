import InternalStep19Form from "@/app/(components)/InternalStep19Form";
import InternalStep19 from "@/app/models/InternalStep19";
import { connectDB } from "@/app/models/InternalPdca";

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep19.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step19Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep19Form projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step19Page;
