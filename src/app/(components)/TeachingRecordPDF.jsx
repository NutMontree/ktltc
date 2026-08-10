import React, { forwardRef } from "react";

const ImageGrid = ({ images }) => {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="flex justify-center mt-4">
        <img
          src={images[0]}
          alt="Evidence"
          className="max-h-56 max-w-full object-contain rounded-lg border border-gray-300 shadow-sm"
        />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="Evidence"
            className="max-h-56 max-w-[45%] object-contain rounded-lg border border-gray-300 shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="flex flex-col items-center mt-4 gap-4">
        <div className="flex justify-center gap-4">
          <img
            src={images[0]}
            alt="Evidence 1"
            className="max-h-48 max-w-[45%] object-contain rounded-lg border border-gray-300 shadow-sm"
          />
          <img
            src={images[1]}
            alt="Evidence 2"
            className="max-h-48 max-w-[45%] object-contain rounded-lg border border-gray-300 shadow-sm"
          />
        </div>
        <div className="flex justify-center">
          <img
            src={images[2]}
            alt="Evidence 3"
            className="max-h-48 max-w-[80%] object-contain rounded-lg border border-gray-300 shadow-sm"
          />
        </div>
      </div>
    );
  }

  // Fallback for > 3
  return (
    <div className="grid grid-cols-2 gap-4 mt-4 justify-items-center">
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt="Evidence"
          className="max-h-40 max-w-full object-contain rounded-lg border border-gray-300 shadow-sm"
        />
      ))}
    </div>
  );
};

const TeachingRecordPDF = forwardRef(({ record, records: propRecords }, ref) => {
  const records = propRecords || (record ? [record] : []);

  if (!records || records.length === 0) return null;

  const formatDateToThai = (dateString) => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-");
      const thaiMonths = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
      ];
      const thaiYear = parseInt(year) + (parseInt(year) < 2500 ? 543 : 0);
      return `${parseInt(day)} ${thaiMonths[parseInt(month) - 1]} ${thaiYear}`;
    }
    return dateString;
  };

  return (
    <div ref={ref} className="w-full">
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 0; }
          @media print {
            body { margin: 0; padding: 0; background-color: white; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            /* ป้องกันการแตกหน้า (Page break) ภายในเนื้อหาที่ไม่จำเป็น */
            .avoid-break { page-break-inside: avoid; }
            .page-break { page-break-after: always; }
          }
        `}
      </style>

      {records.map((rec, index) => (
        <div
          key={rec._id || index}
          className={`bg-white text-black print:bg-white print:text-black w-full ${index < records.length - 1 ? 'page-break' : ''}`}
          style={{
            padding: "15mm 20mm",
            width: "210mm",
            minHeight: "297mm",
            margin: "0 auto",
            fontFamily: "'Sarabun', 'TH Sarabun New', sans-serif",
          }}
        >
          {/* หัวกระดาษ */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">บันทึกหลังการจัดการเรียนรู้</h1>
            <h2 className="text-xl font-bold">วิทยาลัยเทคนิคกันทรลักษ์</h2>
          </div>

          {/* ข้อมูลทั่วไป */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-8 text-[15pt]">
            <div><span className="font-bold">รหัสวิชา:</span> {rec.courseCode}</div>
            <div><span className="font-bold">ชื่อวิชา:</span> {rec.courseName}</div>
            
            <div><span className="font-bold">ภาคเรียนที่:</span> {rec.semester}</div>
            <div><span className="font-bold">ปีการศึกษา:</span> {rec.academicYear}</div>
            
            <div><span className="font-bold">วันที่สอน:</span> {formatDateToThai(rec.date)}</div>
            <div><span className="font-bold">สัปดาห์ที่:</span> {rec.weekNo}</div>
            
            <div className="col-span-2">
              <span className="font-bold">รูปแบบการสอน:</span> {rec.isTheory ? "ทฤษฎี " : ""}{rec.isPractice ? "ปฏิบัติ" : ""}
            </div>
            
            <div className="col-span-2">
              <span className="font-bold">หน่วยการเรียนรู้ที่:</span> {rec.unitNo} <span className="ml-4 font-bold">ชื่อหน่วย:</span> {rec.unitName}
            </div>
            
            <div className="col-span-2">
              <span className="font-bold">เรื่อง:</span> {rec.topic}
            </div>
          </div>

          {/* รายละเอียดการสอน */}
          <div className="space-y-6 text-[15pt]">
        
        {/* 1. กิจกรรมการเรียนการสอน */}
        <div className="avoid-break">
          <h3 className="font-bold mb-2">1. กิจกรรมการเรียนการสอน</h3>
          <div className="pl-4 whitespace-pre-wrap leading-relaxed">{rec.activities}</div>
          <ImageGrid images={rec.activitiesImages} />
        </div>

        {/* 2. ผลการดำเนินกิจกรรม */}
        <div className="avoid-break mt-6">
          <h3 className="font-bold mb-2">2. ผลการดำเนินกิจกรรมการเรียนการสอน</h3>
          <div className="pl-4 whitespace-pre-wrap leading-relaxed">{rec.results}</div>
          <ImageGrid images={rec.resultsImages} />
        </div>

        {/* 3. ปัญหาอุปสรรค */}
        <div className="avoid-break mt-6">
          <h3 className="font-bold mb-2">3. ปัญหาอุปสรรค / แนวทางการแก้ไขปัญหา</h3>
          <div className="pl-4 whitespace-pre-wrap leading-relaxed">{rec.problems}</div>
          <ImageGrid images={rec.problemsImages} />
        </div>

      </div>

      {/* ลายเซ็น */}
      <div className="mt-16 grid grid-cols-2 gap-8 avoid-break text-[15pt]">
        <div className="flex flex-col items-center justify-end">
          {rec.teacherSignature ? (
            <img src={rec.teacherSignature} alt="Teacher Signature" className="h-16 w-auto mb-2 object-contain" />
          ) : (
            <div className="h-16 mb-2"></div>
          )}
          <div className="border-t border-black w-48 text-center pt-2">
            ( {rec.signerName} )
          </div>
          <div className="text-center mt-1">ครูผู้สอน</div>
        </div>

        <div className="flex flex-col items-center justify-end">
          {rec.headSignature ? (
            <img src={rec.headSignature} alt="Head Signature" className="h-16 w-auto mb-2 object-contain" />
          ) : (
            <div className="h-16 mb-2"></div>
          )}
          <div className="border-t border-black w-48 text-center pt-2">
            ( {rec.headName} )
          </div>
          <div className="text-center mt-1">หัวหน้าแผนกวิชา</div>
        </div>
      </div>
    </div>
  ))}
</div>
  );
});

TeachingRecordPDF.displayName = "TeachingRecordPDF";

export default TeachingRecordPDF;
