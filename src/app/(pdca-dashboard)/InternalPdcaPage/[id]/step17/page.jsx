import InternalStep17Form from "@/app/(components)/InternalStep17Form";
import InternalStep17 from "@/app/models/InternalStep17";
import { connectDB } from "@/app/models/InternalPdca";

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep17.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step17Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep17Form projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step17Page;
