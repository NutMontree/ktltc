import InternalStep13Form from "@/app/(components)/InternalStep13Form";
import InternalStep13 from "@/app/models/InternalStep13";
import { connectDB } from "@/app/models/InternalPdca";

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep13.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step13Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep13Form projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step13Page;
