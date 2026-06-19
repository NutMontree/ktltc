import InternalStep15Form from "@/app/(components)/InternalStep15Form";
import InternalStep15 from "@/app/models/InternalStep15";
import { connectDB } from "@/app/models/InternalPdca";

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep15.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step15Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep15Form projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step15Page;
