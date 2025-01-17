"use client"; // top to the file
import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";

export default function ShowFacebook() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xxl pt-3 font-bold pb-8 ">
          Page Facebook
        </h1>
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
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 ">
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
