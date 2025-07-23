"use client"
import { Accordion, AccordionItem } from "@heroui/react";
import { Image } from "@nextui-org/react";
import O1 from "./01/page";
import O2 from "./02/page";
import O3 from "./03/page";
import O4 from "./04/page";
import O5 from "./05/page";
import O6 from "./06/page";
import O7 from "./07/page";
import O8 from "./08/page";
import O9 from "./09/page";
import O10 from "./010/page";
import O11 from "./011/page";
import O12 from "./012/page";
import O13 from "./013/page";
import O14 from "./014/page";
import O15 from "./015/page";
import O16 from "./016/page";
import O17 from "./017/page";
import O18 from "./018/page";
import O19 from "./019/page";
import O20 from "./020/page";
import O21 from "./021/page";
import O22 from "./022/page";
import O23 from "./023/page";
import O24 from "./024/page";
import O25 from "./025/page";
import O26 from "./026/page";
import O27 from "./027/page";
import O28 from "./028/page";
import O29 from "./029/page";
import O30 from "./030/page";
import O31 from "./031/page";
import O32 from "./032/page";
import O33 from "./033/page";
import O34 from "./034/page";
import O35 from "./035/page";
import O36 from "./036/page";
import O37 from "./037/page";

export default function ITA() {

    return (
        <>
            <div className="py-[84px]">
                <p className="text-center text-xl">ประเมินคุณธรรมและความโปร่งใส (ITA)</p>
                <p className="text-center pt-2">
                    การประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ <br />
                    ( Integrity and Transparency Assessment)<br />
                    ระบบช่วยตรวจสอบข้อมูล สำหรับเจ้าหน้าที่ผู้ปฏิบัติงาน<br />
                    วิทยาลัยเทคนิคกันทรลักษ์
                </p>
            </div>

            <div className="pb-12">
                <Accordion variant="splitted" disabledKeys={["2"]}>
                    <AccordionItem key="1" aria-label="ITA คืออะไร ?" title="ITA คืออะไร ?">
                        <div className="py-4">
                            <div className="grid md:grid-flow-col">
                                <div className="rounded-xl">
                                    <Image
                                        src="/images/ita/ita.webp"
                                        alt="ITA Image"
                                        className="mx-auto" />
                                </div>
                                <div className="bg-slate-300rounded-xl">
                                    <div className="text-center font-bold text-xl">
                                        <div>
                                            ITA คืออะไร ?
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <div className="font-bold">I</div>
                                        <div className="pr-1">ntegrity</div>
                                        <div className="pr-1">and</div>
                                        <div className="font-bold">T</div>
                                        <div className="pr-1">ransparency</div>
                                        <div className="font-bold">A</div>
                                        <div className="pr-1">ssessment</div>
                                    </div>
                                    <div>
                                        <div>
                                            การประเมินคุณธรรม และความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ
                                            แบบตรวจการเปิดเผยข้อมูลสาธารณะ (OIT) มีวัตถุประสงค์เพื่อเป็นการประเมินระดับการเปิดเผยข้อมูลต่อสาธารณะของหน่วยงาน เพื่อให้ประชาชนทั่วไปสามารถเข้าถึงได้ ในตัวชี้วัดการเปิดเผยข้อมูล และการป้องกันการทุจริต สำหรับการประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AccordionItem>
                </Accordion>

            </div>

            <div>
                <Accordion
                    variant="splitted" disabledKeys={[
                        "4",
                        "5",
                        "6",
                        "8",
                        "10",
                        "11",
                        "14",
                        "15",
                        "16",
                        "17",
                        "18",
                        "19",
                        "21",
                        "22",
                        "23",
                        "24",
                        "25",
                        "26",
                        "27",
                        "28",
                        "32",
                        "33",
                        "35",
                        "36",
                        "37",
                    ]}>
                    <AccordionItem key="1" aria-label="1" title="O1 โครงสร้าง">
                        <O1 />
                    </AccordionItem>
                    <AccordionItem key="2" aria-label="2" title="O2 ข้อมูลผู้บริหาร">
                        <O2 />
                    </AccordionItem>
                    <AccordionItem key="3" aria-label="3" title="O3 อำนาจหน้าที่">
                        <O3 />
                    </AccordionItem>
                    <AccordionItem key="4" aria-label="4" title="O4 แผนพัฒนา สถานศึกษา">
                        <O4 />
                    </AccordionItem>
                    <AccordionItem key="5" aria-label="5" title="O5 ข้อมูลการติดต่อ">
                        <O5 />
                    </AccordionItem>
                    <AccordionItem key="6" aria-label="6" title="O6 กฎหมายที่เกี่ยวข้อง">
                        <O6 />
                    </AccordionItem>
                    <AccordionItem key="7" aria-label="7" title="O7 ข่าวประชาสัมพันธ์">
                        <O7 />
                    </AccordionItem>
                    <AccordionItem key="8" aria-label="8" title="O8 Q&A">
                        <O8 />
                    </AccordionItem>
                    <AccordionItem key="9" aria-label="9" title="O9 Social Network">
                        <O9 />
                    </AccordionItem>
                    <AccordionItem key="10" aria-label="10" title="O10 แผนดำเนินงานประจำปี">
                        <O10 />
                    </AccordionItem>
                    <AccordionItem key="11" aria-label="11" title="O11 รายงานผลการดําเนินงานประจําปี">
                        <O11 />
                    </AccordionItem>
                    <AccordionItem key="12" aria-label="12" title="O12 คู่มือหรือมาตรฐานการปฏิบัติงาน">
                        <O12 />
                    </AccordionItem>
                    <AccordionItem key="13" aria-label="13" title="O13 คู่มือหรือมาตรฐาน การให้บริการ">
                        <O13 />
                    </AccordionItem>
                    <AccordionItem key="14" aria-label="14" title="O14 ข้อมูลเชิงสถิติ การให้บริการ">
                        <O14 />
                    </AccordionItem>
                    <AccordionItem key="15" aria-label="15" title="O15 รายงานผลการ สํารวจความ พึงพอใจการให้บริการ">
                        <O15 />
                    </AccordionItem>
                    <AccordionItem key="16" aria-label="16" title="O16 E-Service">
                        <O16 />
                    </AccordionItem>
                    <AccordionItem key="17" aria-label="17" title="O17 แผนการใช้จ่าย งบประมาณ ประจําปี">
                        <O17 />
                    </AccordionItem>
                    <AccordionItem key="18" aria-label="18" title="O18 ผลการใช้จ่าย งบประมาณ ประจําปี">
                        <O18 />
                    </AccordionItem>
                    <AccordionItem key="19" aria-label="19" title="O19 แผนการจัดซื้อจัด จ้างหรือแผนการจัดหาพัสดุ">
                        <O19 />
                    </AccordionItem>
                    <AccordionItem subtitle={<span> ทำเอกสารเพิ่มเติม <strong>ข้อมูลไม่ครบ</strong> </span>} key="20" aria-label="20" title="O20 ประกาศต่าง ๆ เกี่ยวกับการจัดซื้อจัดจ้างหรือการ จัดหาพัสดุ">
                        <O20 />
                    </AccordionItem>
                    <AccordionItem key="21" aria-label="21" title="O21 สรุปผลการจัดซื้อ จัดจ้างหรือจัดหาพัสดุรายเดือน">
                        <O21 />
                    </AccordionItem>
                    <AccordionItem key="22" aria-label="22" title="O22 แผนการจัดซื้อจัดจ้างหรือแผนการจัดหาพัสดุ">
                        <O22 />
                    </AccordionItem>
                    <AccordionItem key="23" aria-label="23" title="O23 การดําเนิน โครงการ/กิจกรรม ที่แสดงถึง การพัฒนา ทรัพยากรบุคคล">
                        <O23 />
                    </AccordionItem>
                    <AccordionItem key="24" aria-label="24" title="O24 หลักเกณฑ์การ บริหารและพัฒนา ทรัพยากรบุคคล">
                        <O24 />
                    </AccordionItem>
                    <AccordionItem key="25" aria-label="25" title="O25 รายงานผลการ ดําเนินโครงการ/ กิจกรรมที่แสดงถึง การพัฒนา ทรัพยากรบุคคล">
                        <O25 />
                    </AccordionItem>
                    <AccordionItem key="26" aria-label="26" title="O26 แนวทางปฏิบัติการ จัดการร้องเรียนการทุจริตและ ประพฤติมิชอบ">
                        <O26 />
                    </AccordionItem>
                    <AccordionItem key="27" aria-label="27" title="O27 ช่องทางแจ้งเรื่อง ร้องเรียนการทุจริตและประพฤติ มิชอบ">
                        <O27 />
                    </AccordionItem>
                    <AccordionItem key="28" aria-label="28" title="O28 ข้อมูลเชิงสถิติเรื่อง ร้องเรียนการทุจริตและประพฤติมิชอบ">
                        <O28 />
                    </AccordionItem>
                    <AccordionItem key="29" aria-label="29" title="O29 การเปิดโอกาสให้ เกิดการมีส่วนร่วม">
                        <O29 />
                    </AccordionItem>
                    <AccordionItem key="30" aria-label="30" title="O30 นโยบายไม่รับ ของขวัญ (No Gift Policy)">
                        <O30 />
                    </AccordionItem>
                    <AccordionItem key="31" aria-label="31" title="O31 การมีส่วนร่วมของ ผู้บริหาร สถานศึกษา">
                        <O31 />
                    </AccordionItem>
                    <AccordionItem key="32" aria-label="32" title="O32 การประเมินผล ควบคุมภายใน">
                        <O32 />
                    </AccordionItem>
                    <AccordionItem key="33" aria-label="33" title="O33 การเสริมสร้าง วัฒนธรรมองค์กร">
                        <O33 />
                    </AccordionItem>
                    <AccordionItem key="34" aria-label="34" title="O34 โครงการ/กิจกรรม ที่เกี่ยวข้องกับ การป้องกัน การทุจริต">
                        <O34 />
                    </AccordionItem>
                    <AccordionItem key="35" aria-label="35" title="O35 รายงานผลการ ดําเนินโครงการ/ กิจกรรมที่เกี่ยวกับ การป้องกัน การ ทุจริตประจําปี">
                        <O35 />
                    </AccordionItem>
                    <AccordionItem key="36" aria-label="36" title="O36 มาตรการส่งเสริม คุณธรรมและความโปร่งใส ภายในสถานศึกษา">
                        <O36 />
                    </AccordionItem>
                    <AccordionItem key="37" aria-label="37" title="O37 การดําเนินการ ตามมาตรการ ส่งเสริม คุณธรรมและ ความโปร่งใส ภายในสถานศึกษา">
                        <O37 />
                    </AccordionItem>
                </Accordion>
            </div >
        </>
    )
}