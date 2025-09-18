"use client"; // top to the file
import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { Image } from "@nextui-org/react";

export default function Showvideo() {
  return (
    <>
      <div className="flex justify-center gap-4">
        <div className="flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="#ff0000be" viewBox="0 0 256 256"><path d="M196,128a32,32,0,0,1-32,32H152V96h12A32,32,0,0,1,196,128Zm36-72V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM120,88a8,8,0,0,0-16,0v32H64V88a8,8,0,0,0-16,0v80a8,8,0,0,0,16,0V136h40v32a8,8,0,0,0,16,0Zm92,40a48.05,48.05,0,0,0-48-48H144a8,8,0,0,0-8,8v80a8,8,0,0,0,8,8h20A48.05,48.05,0,0,0,212,128Z"></path></svg>
        </div>
        <h1 className="text-3xl pt-4 font-bold pb-8">Youtube</h1>
      </div>
      <div>
        <div>
          <div className="">
            <Accordion isCompact>
              <AccordionItem
                key="1"
                aria-label="Accordion 1"
                title="Open Button"
                className=" border rounded-xl px-4 py-1 shadow-xl "
              >
                <div className="flex justify-center px-[24px]">
                  <div className="gap-[24px] grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 justify-items-center">
                    <div >
                      <iframe
                        src="https://www.youtube.com/embed/tEqHeRdAiD0?si=q8RHAfYFgNKyCzzB"
                        className="h-[200px] sm:h-[300px] lg:h-[300px] xl:h-[300px] 
                                   w-[300px] sm:w-[500px] lg:w-[400px] xl:w-[300px]    
                                   rounded-2xl"
                        width="560"
                        height="315"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen>
                      </iframe>
                      <div className="text-[12px] md:text-[14px] sm:text-sm md:text-base mb-2 pt-6">
                        <p className="text-center">ภาพบรรยากาศ วันที่ 24 กรกฎาคม - 5  สิงหาคม 2568</p>
                        <p>
                          13 วัน ในครอบครัว KTL- TC  จากวันแรก จนถึงวันนี้
                          เราได้เรียนรู้อะไรมากมาย
                          ได้รู้ว่าพลังแห่งการทุ่มเทของพวกเรามันยิ่งใหญ่แค่ไหน
                          ได้เรียนรู้การช่วยเหลือ การลงมือทำมากกว่าการพูด มันชุ่มชื่นหัวใจยังไง
                          ได้ปิดทองหลังพระมันสุดยอดแค่ไหน
                          ได้เห็นน้ำใจของคนไทยมันมหาศาลมากมายเพียงใด
                          สุดท้ายแล้วคนที่รู้ดีที่สุดว่าเราทำอะไร ยังไง เพื่อพี่น้องผู้อพยพ ให้ได้กินอิ่ม นอนหลับและอยู่อย่างสบาย คือตัวเราเอง ครูและบุคลากรหลายคน ต้องอพยพคนในครอบครัวตัวเอง แล้วรีบกลับมาทำหน้าที่ดูแลพี่น้องประชาชน  ขอบคุณพี่น้องวิทยาลัยเทคนิคกันทรลักษ์ที่สู้และลงมือทำมาด้วยกัน บางคนหน้ากลำแดด บางคนอดหลับอดนอน บางคนทำกับข้าวทั้งวัน บางคนยกของบริจาคหลังแทบเคล็ด บางคนรับแขกรับคนทั้งวัน บางคนทำความสะอาดสถานที่ตลอดเวลา บางคนแพ็คของบริจาคเพื่อแจกจ่าย บางคนลงทะเบียนเก็บข้อมูล บางคนดูระบบน้ำ ระบบไฟบางคนเข้าเวรเพื่อรักษาความปลอดภัยให้พ่อแม่พี่น้อง บางคนเข้าเวรดูแลผู้ป่วย ส่วนน้าๆนักการ ต้องล้วง ล้างส้วมทุกวันฯลฯ  ช่วง 4 วันแรก เริ่มงาน ตี 4 เลิกงาน 5 ทุ่ม  หลังจากนั้น เริ่มงานตี 5  เลิกงาน 3 ทุ่ม  ไม่ต้องถามว่าล้ากันแค่ไหน  แต่ใจเราสู้ทุกวัน  ขอบคุณทุกสรรพกำลัง ขอบคุณพี่น้องจิตอาสา  ขอบคุณพี่น้องชาวบ้านที่รักและเอ็นดูพวกเรา  ทุกคนรู้ว่าพวกเราดูแลเค้ายังไง  เราไม่สนใจคนข้างนอก จะคิดยังไงก็แล้วแต่เค้า ห้ามกันไม่ได้  ขอบคุณลูกๆ นร. นศ. ที่อดทนรอคอยในการหยุดพักการเรียนการสอนเพื่อให้พ่อครูแม่ครูได้ดูแลพี่น้องประชาชน   หลังจากนี้พวกเราจะกลับมาทำหน้าที่หลัก แต่ก็ยังต้องถูกมอบหมายไปช่วยเหลือพี่น้องตามศูนย์ต่างๆ  ขอให้เราได้จดจำช่วงเวลาที่ผ่านมา ว่าเราทำ เราทุ่มเท เรารัก  และเราคิดถึง  ขอให้ทุกท่านแข็งแรง เข้มแข็งทั้งร่างกายและจิตใจ
                          <br />  วิทยาลัยเทคนิคกันทรลักษ์ ขอขอบพระคุณทุกท่านที่ช่วยเหลือ เเละให้กำลังใจ
                        </p>
                      </div>
                    </div>
                    <div >
                      <iframe
                        src="https://www.youtube.com/embed/k7hgxrwGgrw?si=VWg12pZKYfKEVnUz"
                        className="h-[200px] sm:h-[300px] lg:h-[300px] xl:h-[300px] 
                                   w-[300px] sm:w-[500px] lg:w-[400px] xl:w-[300px]    
                                   rounded-2xl"
                        width="560"
                        height="315"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen>
                      </iframe>
                      <div className="text-[12px] md:text-[14px] sm:text-sm md:text-base mb-2 pt-6">
                        <p className="text-center">วิทยาลัยเทคนิคกันทรลักษ์</p>
                        <p>
                          ขอขอบคุณ คณะผู้บริหาร นำโดย นางสาวทักษิณา ชมจันทร์ ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์ พร้อมด้วยคณะครู บุคลากรทางการศึกษา นักเรียน นักศึกษาทุกท่าน ในการรับมือสถานการณ์ปะทะชายเเดนไทย - กัมพูชา เเละได้รับมือดูเเลศูนย์พักพิงผู้อพยพวิทยาลัยเทคนิคกันทรลักษ์
                          ระหว่างวันที่ 24 กรกฎาคม - 5 สิงหาคม 2568
                          😍พวกเราเก่งมาก😍 เต็มที่กับทุกอย่าง เพื่อให้ประชาชน 5,000 กว่าคนที่มาศูนย์พักพิงฯ เเห่งนี้  มีความสุขทุกช่วงเวลา
                          พวกเราขอให้ทุกคนปลอดภัย
                        </p>
                      </div>
                    </div>
                    <div >
                      <iframe
                        src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1804472173610242%2F&show_text=true&width=560&t=0"
                        className="h-[200px] sm:h-[300px] lg:h-[300px] xl:h-[300px] 
                                   w-[300px] sm:w-[500px] lg:w-[400px] xl:w-[300px]    
                                   rounded-2xl"
                        width="560"
                        height="315"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen>
                      </iframe>
                    </div>
                  </div>
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>



    </>
  );
}
