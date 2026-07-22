import React, { forwardRef } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface PrintTemplateProps {
  reports: any[];
  roleMap: Record<string, string>;
  dailySummary?: any[];
}

export const PrintTemplate = forwardRef<HTMLDivElement, PrintTemplateProps>(
  ({ reports, roleMap, dailySummary }, ref) => {
    if (!reports || reports.length === 0) return null;

    return (
      <div ref={ref} className="bg-white text-black p-0 hidden print:block w-full">
        <style type="text/css" media="print">
          {`
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
            @page { size: A4 portrait; margin: 10mm; }
            .page-break { page-break-after: always; }
            .font-sarabun, .font-sarabun * { 
              font-family: 'TH Sarabun PSK', 'TH Sarabun New', 'Sarabun', sans-serif !important; 
            }
          `}
        </style>

        {dailySummary && dailySummary.length > 0 && (
          <div className="page-break mb-8 w-full max-w-4xl mx-auto font-sarabun text-xl">
            <div className="text-center mb-6 border-b-2 border-black pb-4">
              <h1 className="text-3xl font-bold mb-2">สรุปการส่งรายงานการปฏิบัติงาน</h1>
              <h2 className="text-2xl">วิทยาลัยเทคนิคกันทรลักษ์</h2>
            </div>

            {dailySummary.filter(sum => sum.submittedUsers?.length > 0).map((sum, i) => (
              <div key={i} className="mb-8 break-inside-avoid">
                <h3 className="text-2xl font-bold border-b border-gray-300 mb-3 pb-1">
                  วันที่: {format(new Date(sum.date), "dd MMMM yyyy", { locale: th })}
                </h3>
                
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-green-700 mb-2">
                    ส่งรายงานแล้ว ({sum.submittedUsers?.length || 0} คน)
                  </h4>
                  {sum.submittedUsers?.length > 0 ? (
                    <ul className="list-disc pl-6 space-y-1">
                      {sum.submittedUsers.map((u: any, idx: number) => (
                        <li key={idx}>
                          {u.name} - {roleMap[u.role] || u.role} ({u.department || "-"})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 pl-6">ไม่มีผู้ส่งรายงาน</p>
                  )}
                </div>

                <div>
                  <h4 className="text-xl font-bold text-red-700 mb-2">
                    ยังไม่ส่งรายงาน ({sum.missingUsers?.length || 0} คน)
                  </h4>
                  {sum.missingUsers?.length > 0 ? (
                    <ul className="list-disc pl-6 space-y-1">
                      {sum.missingUsers.map((u: any, idx: number) => (
                        <li key={idx}>
                          {u.name} - {roleMap[u.role] || u.role} ({u.department || "-"})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 pl-6">ส่งครบทุกคน</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {reports.map((report, idx) => {
          const roleName = roleMap[report.user?.role] || report.user?.role || "-";
          
          return (
            <div key={report.id || idx} className="page-break mb-8 w-full max-w-4xl mx-auto font-sarabun text-xl">
              <div className="text-center mb-6 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-bold mb-2">รายงานการปฏิบัติงาน</h1>
                <h2 className="text-2xl">วิทยาลัยเทคนิคกันทรลักษ์</h2>
              </div>
              
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div><strong>ชื่อ-สกุล:</strong> {report.user?.name || "-"}</div>
                <div><strong>ตำแหน่ง:</strong> {roleName}</div>
                <div><strong>แผนก:</strong> {report.user?.department || "-"}</div>
                <div>
                  <strong>วันที่:</strong>{" "}
                  {format(new Date(report.date), "dd MMMM yyyy", { locale: th })}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold border-b border-gray-300 mb-3 pb-1">รายละเอียดกิจกรรม</h3>
                {report.activities && report.activities.length > 0 ? (
                  <ul className="list-decimal pl-6 space-y-3">
                    {report.activities.map((act: any, i: number) => (
                      <li key={i}>
                        <div className="font-semibold">{act.taskName} <span className="text-lg font-normal text-gray-600">[{act.status === "Completed" ? "สำเร็จ" : act.status === "In Progress" ? "กำลังดำเนินการ" : "รอการดำเนินการ"}]</span></div>
                        {act.detail && <div className="mt-1 text-gray-700">{act.detail}</div>}
                        
                        {act.images && act.images.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {act.images.map((img: string, imgIdx: number) => (
                              img.startsWith("data:application/pdf") || img.endsWith(".pdf") ? (
                                <div key={imgIdx} className="w-32 h-32 flex flex-col items-center justify-center border border-gray-300 rounded text-gray-500 bg-gray-50">
                                  <span>[แนบไฟล์ PDF]</span>
                                </div>
                              ) : (
                                <img key={imgIdx} src={img} alt="proof" className="w-32 h-32 object-cover border border-gray-300 rounded" />
                              )
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">ไม่มีกิจกรรม</p>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold border-b border-gray-300 mb-3 pb-1">สรุปภาพรวมการทำงาน</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{report.summary || "-"}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold border-b border-gray-300 mb-3 pb-1">ปัญหาที่พบ / อุปสรรค</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{report.problems || "-"}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold border-b border-gray-300 mb-3 pb-1">แผนการปฏิบัติงานวันถัดไป</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{report.plansNextDay || "-"}</p>
              </div>

              {report.images && report.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold border-b border-gray-300 mb-3 pb-1">รูปรวมผลงาน</h3>
                  <div className="flex gap-4 flex-wrap">
                    {report.images.map((img: string, i: number) => (
                      img.startsWith("data:application/pdf") || img.endsWith(".pdf") ? (
                        <div key={i} className="w-40 h-40 flex flex-col items-center justify-center border border-gray-300 rounded text-gray-500 bg-gray-50">
                          <span>[แนบไฟล์ PDF]</span>
                        </div>
                      ) : (
                        <img key={i} src={img} alt="report proof" className="w-40 h-40 object-cover border border-gray-300 rounded" />
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);
PrintTemplate.displayName = "PrintTemplate";
