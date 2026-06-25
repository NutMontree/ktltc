import InternalStep15Form from "@/app/(components)/InternalStep15Form";
import InternalStep15 from "@/app/models/InternalStep15";
import { connectDB } from "@/app/models/InternalPdca";

export const dynamic = 'force-dynamic';

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep15.findOne({ projectId });
    const projectData = await InternalPdca.findById(projectId);
    return {
      memoData: JSON.parse(JSON.stringify(data || {})),
      projectData: JSON.parse(JSON.stringify(projectData || {})),
    };
  } catch (error) {
    return { memoData: {}, projectData: {} };
  }
};

const Step15Page = async ({ params }) => {
  const { id } = await params;
  const { memoData, projectData } = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep15Form projectId={id} initialData={memoData} projectData={projectData} />
      </div>
    </>
  );
};

export default Step15Page;
