export const dynamic = "force-dynamic";
import ProjectDetailForm from "@/app/(components)/ProjectDetailForm";
import ProjectDetail from "@/app/models/ProjectDetail";
import InternalPdca, { connectDB } from "@/app/models/InternalPdca";

async function getStep3Data(projectId) {
  try {
    await connectDB();
    const [detailData, parentData] = await Promise.all([
      ProjectDetail.findOne({ projectId }),
      InternalPdca.findById(projectId)
    ]);

    const result = detailData ? JSON.parse(JSON.stringify(detailData)) : {};
    
    // If we have parent data, ensure the projectName matches the parent's nameproject
    if (parentData) {
      result.projectName = parentData.nameproject;
      result.departmentName = parentData.namework;
      result.divisionName = parentData.department;
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching step 3 data:", error);
    return {};
  }
}

const Step3Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getStep3Data(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <ProjectDetailForm projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step3Page;
