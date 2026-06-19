import EditPdcaForm from "@/app/(components)/EditPdcaForm";
import Pdca from "@/app/models/Pdca";

const getPdcaById = async (id) => {
  try {
    // 1. Fetch data directly from MongoDB
    const pdca = await Pdca.findById(id).lean();
    if (!pdca) return null;

    // 2. Convert all MongoDB specific objects (including nested ObjectIds in attachments) to plain strings
    // JSON.stringify will automatically call .toString() on ObjectIds and .toISOString() on Dates
    return JSON.parse(JSON.stringify(pdca));
  } catch (error) {
    console.error("Fetch PDCA error directly from DB:", error);
    return null;
  }
};

const PdcaPage = async ({ params }) => {
  let updatePdcaData = { _id: "new" };
  const { id } = await params;
  const EDITMODE = id === "new" ? false : true;

  if (EDITMODE) {
    const data = await getPdcaById(id);
    if (data) {
      // Direct data instead of data.foundPdca
      updatePdcaData = data;
    }
  }

  return <EditPdcaForm pdca={updatePdcaData} />;
};

export default PdcaPage;
