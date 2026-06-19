import InternalStep5Form from "@/app/(components)/InternalStep5Form";
import InternalStep5 from "@/app/models/InternalStep5";
import { connectDB } from "@/app/models/InternalPdca";

const getStep5Data = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep5.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step5Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getStep5Data(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep5Form projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step5Page;
