import InternalStep14Form from "@/app/(components)/InternalStep14Form";
import InternalStep14 from "@/app/models/InternalStep14";
import InternalPdca, { connectDB } from "@/app/models/InternalPdca";

export const dynamic = 'force-dynamic';

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalStep14.findOne({ projectId });
    const projectData = await InternalPdca.findById(projectId);
    return {
      memoData: JSON.parse(JSON.stringify(data || {})),
      projectData: JSON.parse(JSON.stringify(projectData || {})),
    };
  } catch (error) {
    return { memoData: {}, projectData: {} };
  }
};

const Step14Page = async ({ params }) => {
  const { id } = await params;
  const { memoData, projectData } = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalStep14Form projectId={id} initialData={memoData} projectData={projectData} />
      </div>
    </>
  );
};

export default Step14Page;
