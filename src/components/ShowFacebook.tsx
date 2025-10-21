"use client"; // top to the file
import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import { motion } from "framer-motion";

export default function ShowFacebook() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex justify-center gap-4">
          <div className="flex justify-center">
            <Image src='/images/icon/facebook-svgrepo-com.svg' alt='logo-youtube' width={60} height={60} />
          </div>
          <h1 className="text-3xl pt-3 font-bold pb-8 ">Facebook</h1>
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
                  <div className=" flex justify-center">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 ">
                      {/* <div className="justify-items-center pt-[24px]">
                      <iframe
                        src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61571228871228&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                        width="340"
                        height="500"
                        scrolling="no"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      ></iframe>
                    </div> */}
                      <div className="justify-items-center pt-[24px]">
                        <iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100088379594921&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" width="340" height="500" className="border-none overflow-hidden" scrolling="no" frameBorder="0" allowFullScreen={true} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
                      </div>
                      <div className="justify-items-center pt-[24px]">
                        <iframe
                          src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61567041267941&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                          width="340"
                          height="500"
                          scrolling="no"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        ></iframe>
                      </div>
                      <div className="justify-items-center pt-[24px]">
                        <iframe
                          src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100065239134417&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                          width="340"
                          height="500"
                          scrolling="no"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        ></iframe>
                      </div>
                      <div className="justify-items-center pt-[24px]">
                        <iframe
                          src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fktltc.ac.th.en&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                          width="340"
                          height="500"
                          scrolling="no"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        ></iframe>
                      </div>
                      <div className="justify-items-center pt-[24px]">
                        <iframe
                          src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100068997166818&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                          width="340"
                          height="500"
                          className="border-none overflow-visible justify-items-center"
                          scrolling="no"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        ></iframe>
                      </div>
                      <div className="justify-items-center pt-[24px]">
                        <iframe
                          src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100057195379923%26mibextid%3DZbWKwL&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                          width="340"
                          height="500"
                          scrolling="no"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        ></iframe>
                      </div>
                      <div className="justify-items-center pt-[24px]">
                        <iframe
                          src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100063483313526&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=952832906928077"
                          width="340"
                          height="500"
                          scrolling="no"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
