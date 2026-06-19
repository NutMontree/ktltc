import InternalMeetingMemoForm from "@/app/(components)/InternalMeetingMemoForm";
import InternalMeetingMemo from "@/app/models/InternalMeetingMemo";
import { connectDB } from "@/app/models/InternalPdca";

const getMemoData = async (projectId) => {
  try {
    await connectDB();
    const data = await InternalMeetingMemo.findOne({ projectId });
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const Step6Page = async ({ params }) => {
  const { id } = await params;
  const initialData = await getMemoData(id);

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <InternalMeetingMemoForm projectId={id} initialData={initialData} />
      </div>
    </>
  );
};

export default Step6Page;
