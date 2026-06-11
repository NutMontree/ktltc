const fs = require('fs');
const file = 'd:/ktltc/src/app/dashboard/dve/student/page.tsx';
let content = fs.readFileSync(file, 'utf8');
const isCRLF = content.includes('\r\n');
const lines = content.split(isCRLF ? '\r\n' : '\n');

const replacement = `                                  {att.assignmentStatus === "Pending" && (
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 block text-center w-full">
                                      ค้างส่ง
                                    </span>
                                  )}
                                  {(!att.assignmentStatus || att.assignmentStatus === "None") && (
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">
                                      ไม่มีงาน
                                    </span>
                                  )}
                                </div>
                                
                                <div className="space-y-1.5">
                                  <span className="text-zinc-400 block text-[10px]">
                                    คะแนนสอบรวม
                                  </span>
                                  <span className="font-black text-cyan-600 dark:text-cyan-400">
                                    {att.score ? \`\${att.score} คะแนน\` : "-"}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Action Row */}
                              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <button
                                  onClick={() => {
                                    openImageModal(att);
                                  }}
                                  className="text-cyan-600 dark:text-cyan-400 text-xs font-bold hover:underline flex items-center gap-1.5 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1.5 rounded-xl transition-colors"
                                >
                                  <Paperclip size={14} />
                                  จัดการส่งงาน/เอกสาร
                                </button>
                                
                                {att.imageUrl && (
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => {
                                        setFilePreviewUrl(att.imageUrl);
                                        setFilePreviewName(\`เอกสารแนบ - \${att.date}\`);
                                      }}
                                      className="text-zinc-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                      title="ดูไฟล์แนบ"
                                    >
                                      <FileText size={18} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>`;

// Delete 12 lines starting at index 1706 (line 1707) and insert the replacement
lines.splice(1706, 12, ...replacement.split('\n'));
fs.writeFileSync(file, lines.join(isCRLF ? '\r\n' : '\n'), 'utf8');
console.log('Fixed syntax by replacing exact lines!');
