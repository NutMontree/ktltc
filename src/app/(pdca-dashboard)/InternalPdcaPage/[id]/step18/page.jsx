import InternalStep18Form from "@/app/(components)/InternalStep18Form";
import InternalStep18 from "@/app/models/InternalStep18";
import { connectDB } from "@/app/models/InternalPdca";

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep18.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step18Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep18Form projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step18Page;
