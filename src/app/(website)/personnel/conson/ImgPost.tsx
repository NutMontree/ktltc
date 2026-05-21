import { UserOutlined, GlobalOutlined, SafetyCertificateOutlined, DatabaseOutlined, BookOutlined, PhoneOutlined } from "@ant-design/icons";

export const ImgPost = (props: { img: any; onBgClick: any }) => {
  const { img, onBgClick } = props;
  
  // Format Thai dates nicely
  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <div className="w-full h-full max-h-[85vh] flex flex-col md:flex-row text-zinc-800 dark:text-zinc-200">
      {/* Left side: Photo & Main titles */}
      <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0">
          {img.img ? (
            <img src={img.img} alt={img.title} className="w-full h-full object-cover object-top" />
          ) : (
            <UserOutlined className="text-8xl text-zinc-300 dark:text-zinc-700" />
          )}
        </div>
        <h3 className="mt-6 text-2xl font-black text-zinc-900 dark:text-white text-center leading-tight">
          {img.title}
        </h3>
        <span className="mt-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 rounded-full font-bold text-xs">
          {img.secondary}
        </span>
        {img.position && (
          <p className="mt-2 text-sm font-bold text-zinc-500 text-center">
            {img.position}
          </p>
        )}
        {img.faction && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mt-1">
            {img.faction}
          </p>
        )}
      </div>

      {/* Right side: Detailed personnel information */}
      <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto max-h-[50vh] md:max-h-full space-y-6">
        <div className="flex justify-between items-center pb-2 border-b dark:border-zinc-800">
          <h4 className="text-lg font-black text-zinc-900 dark:text-white">ข้อมูลส่วนตัวและประวัติการทำงาน</h4>
          <button 
            onClick={onBgClick} 
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold"
          >
            ปิด
          </button>
        </div>

        {/* 1. ที่อยู่ปัจจุบัน */}
        <div className="space-y-3">
          <h5 className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <GlobalOutlined /> ที่อยู่ปัจจุบัน
          </h5>
          <div className="pl-5 text-sm space-y-1">
            {img.addressHouse || img.addressVillage || img.addressSubdistrict ? (
              <>
                {img.addressHouse && <p><span className="text-zinc-400">บ้านเลขที่/หมู่ที่/ซอย:</span> <b className="text-zinc-900 dark:text-white">{img.addressHouse}</b></p>}
                {img.addressVillage && <p><span className="text-zinc-400">อาคาร/หมู่บ้าน/ถนน:</span> <b className="text-zinc-900 dark:text-white">{img.addressVillage}</b></p>}
                {(img.addressSubdistrict || img.addressDistrict || img.addressProvince) && (
                  <p>
                    <span className="text-zinc-400">ตำบล/อำเภอ/จังหวัด:</span>{" "}
                    <b className="text-zinc-900 dark:text-white">
                      {[img.addressSubdistrict, img.addressDistrict, img.addressProvince].filter(Boolean).join(" ")}
                    </b>
                  </p>
                )}
                {img.addressZipcode && <p><span className="text-zinc-400">รหัสไปรษณีย์:</span> <b className="text-zinc-900 dark:text-white">{img.addressZipcode}</b></p>}
              </>
            ) : (
              <p className="text-zinc-400 italic text-xs">ไม่ได้ระบุข้อมูลที่อยู่</p>
            )}
          </div>
        </div>

        {/* 2. สังกัดและตำแหน่ง */}
        <div className="space-y-3">
          <h5 className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <SafetyCertificateOutlined /> ตำแหน่งและสังกัด
          </h5>
          <div className="pl-5 text-sm space-y-1.5">
            <p><span className="text-zinc-400">เลขที่ตำแหน่ง:</span> <b className="text-zinc-900 dark:text-white">{img.positionNumber || "-"}</b></p>
            <p><span className="text-zinc-400">ตำแหน่งงาน:</span> <b className="text-zinc-900 dark:text-white">{img.position || img.secondary}</b></p>
            <p><span className="text-zinc-400">สังกัดโรงเรียน/องค์กร:</span> <b className="text-zinc-900 dark:text-white">{img.affiliation || "วิทยาลัยเทคนิคกันทรลักษ์"}</b></p>
            {img.department && <p><span className="text-zinc-400">แผนกวิชา:</span> <b className="text-zinc-900 dark:text-white">{img.department}</b></p>}
          </div>
        </div>

        {/* 3. ประวัติรับราชการและวันเกษียณ */}
        <div className="space-y-3">
          <h5 className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <DatabaseOutlined /> ประวัติการรับราชการและเกษียณ
          </h5>
          <div className="pl-5 text-sm space-y-1.5">
            <p><span className="text-zinc-400">วันที่เริ่มเข้ารับราชการ:</span> <b className="text-zinc-900 dark:text-white">{formatThaiDate(img.govStartDate)}</b></p>
            <p><span className="text-zinc-400">วันที่ครบเกษียณอายุ:</span> <b className="text-zinc-900 dark:text-white">{formatThaiDate(img.retirementDate)}</b></p>
            <p><span className="text-zinc-400">เกษียณปีงบประมาณ:</span> <b className="text-zinc-900 dark:text-white">{img.retirementFiscalYear ? `พ.ศ. ${img.retirementFiscalYear}` : "-"}</b></p>
          </div>
        </div>

        {/* 4. หน้าที่รับผิดชอบ */}
        <div className="space-y-3">
          <h5 className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <BookOutlined /> หน้าที่รับผิดชอบ
          </h5>
          <div className="pl-5 text-sm space-y-2">
            <div>
              <p className="text-xs text-zinc-400 font-bold">หน้าที่รับผิดชอบ (หัวหน้าแผนก):</p>
              <p className="font-bold text-zinc-900 dark:text-white">{img.respDeptHead || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-bold">หน้าที่รับผิดชอบ (หัวหน้างาน):</p>
              <p className="font-bold text-zinc-900 dark:text-white">{img.respWorkHead || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-bold">หน้าที่รับผิดชอบอื่น:</p>
              <p className="font-bold text-zinc-900 dark:text-white">{img.respOther || "-"}</p>
            </div>
          </div>
        </div>

        {/* 5. ข้อมูลติดต่อ */}
        {(img.phone || img.email) && (
          <div className="space-y-3 pt-2">
            <h5 className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <PhoneOutlined /> ช่องทางการติดต่อ
            </h5>
            <div className="pl-5 text-sm space-y-1">
              {img.phone && <p><span className="text-zinc-400">เบอร์โทรศัพท์:</span> <a href={`tel:${img.phone}`} className="text-blue-600 font-bold hover:underline">{img.phone}</a></p>}
              {img.email && <p><span className="text-zinc-400">อีเมลติดต่อ:</span> <span className="font-bold text-zinc-950 dark:text-white">{img.email}</span></p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
