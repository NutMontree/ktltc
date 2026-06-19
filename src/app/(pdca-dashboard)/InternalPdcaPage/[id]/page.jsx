import EditInternalPdcaForm from "@/app/(components)/EditInternalPdcaForm";
import InternalPdca, { connectDB } from "@/app/models/InternalPdca";
import InternalFormConfig from "@/app/models/InternalFormConfig";

const getInternalPdcaById = async (id) => {
  try {
    await connectDB();
    if (id === "new") return {};
    const data = await InternalPdca.findById(id);
    return JSON.parse(JSON.stringify(data || {}));
  } catch (error) {
    return {};
  }
};

const DEFAULT_ITEMS = [
  "การจัดทำรูปเล่ม PDCA",
  "แบบฟอร์มขออนุมัติโครงการ (งานวางแผน)",
  "แบบฟอร์มขออนุมัติโครงการ (ทั่วไป)",
  "แบบฟอร์มขออนุญาตดำเนินโครงการ",
  "การขอปรับเพิ่มงบประมาณโครงการ",
  "การปรับโครงการเข้าแผนปฏิบัติการ",
  "แบบฟอร์มโครงการมาตรฐาน",
  "บันทึกข้อความรายงานผลการดำเนินงาน",
  "แบบรายงานผลการดำเนินงาน (สรุปย่อ)",
  "เอกสารติดตามและประเมินผล PDCA",
  "รูปภาพและรายงานสรุปผลฉบับสมบูรณ์",
];

const getInternalFormConfig = async () => {
  try {
    await connectDB();
    let config = await InternalFormConfig.findOne({ type: "internal_pdca_form" });
    if (!config) {
      config = await InternalFormConfig.create({
        type: "internal_pdca_form",
        pdcaItems: DEFAULT_ITEMS.map((label, index) => ({ id: index + 1, label })),
        departments: [
          "ฝ่ายยุทธศาสตร์และแผนงาน",
          "ฝ่ายพัฒนากิจการนักเรียน",
          "ฝ่ายวิชาการ",
          "ฝ่ายบริหารทรัพยากร",
        ],
        fiscalYears: ["2567", "2568", "2569", "2570"],
      });
    }
    return JSON.parse(JSON.stringify(config));
  } catch (error) {
    return null;
  }
};

const InternalPdcaPage = async ({ params }) => {
  const { id } = await params;
  const pdca = await getInternalPdcaById(id);
  const config = await getInternalFormConfig();

  return (
    <EditInternalPdcaForm
      pdca={pdca}
      departments={config?.departments || []}
      fiscalYears={config?.fiscalYears || []}
    />
  );
};

export default InternalPdcaPage;
