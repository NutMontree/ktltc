"use client"; // top to the file
import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";
<<<<<<< HEAD
import { Image } from "@heroui/image";
=======
import Image from "next/image";
>>>>>>> 085ced4b3f39ef438bbf48af9752a5595358c88d
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
            <Image
              src="/images/icon/facebook-svgrepo-com.svg"
              alt="logo-youtube"
              width={60}
              height={60}
            />
          </div>
          <h1 className="pb-8 pt-3 text-3xl font-bold">Facebook</h1>
        </div>
        <div>
          <div>
            <div className="">
              <Accordion isCompact>
                <AccordionItem
                  key="1"
                  aria-label="Accordion 1"
                  title="Open Button"
                  className="rounded-xl border px-4 py-1 shadow-xl"
                >
                  <div className="flex justify-center">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
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
                        <iframe
                          src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100088379594921&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                          width="340"
                          height="500"
                          className="overflow-hidden border-none"
                          scrolling="no"
                          frameBorder="0"
                          allowFullScreen={true}
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        ></iframe>
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
                          className="justify-items-center overflow-visible border-none"
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
