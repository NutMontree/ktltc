"use client"; // top to the file
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { DataPressrelease4 } from "./data";
import { Image } from "@nextui-org/react";

export default function Pressrelease() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button onPress={onOpen}>เปิด เพื่อดู</Button>

        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          scrollBehavior={"inside"}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div>
                    {DataPressrelease4.Item.map((item) => (
                      <div key={item.title}>{item.title}</div>
                    ))}
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div>
                    {DataPressrelease4.Item.map((item) => (
                      <div key={item.description}>
                        <div>{item.description}</div>
                        <div className="text-xs text-slate-500">
                          {item.date}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="justify-center flex-col">
                    {DataPressrelease4.Item.map((item) => (
                      <div
                        className="mb-4 group relative shadow-lg rounded-xl px-[144px] py-[144px]"
                        key={item.img1}
                      >
                        <div className="absolute inset-0 bg-cover bg-center rounded-xl hover:scale-110 transition duration-500 cursor-pointer object-cover">
                          <Image src={item.img1} alt={""}></Image>
                          <Image src={item.img2} alt={""}></Image>
                          <Image src={item.img3} alt={""}></Image>
                          <Image src={item.img4} alt={""}></Image>
                          <Image src={item.img5} alt={""}></Image>
                          <Image src={item.img6} alt={""}></Image>
                          <Image src={item.img7} alt={""}></Image>
                          <Image src={item.img8} alt={""}></Image>
                          <Image src={item.img9} alt={""}></Image>
                          <Image src={item.img10} alt={""}></Image>
                          <Image src={item.img11} alt={""}></Image>
                          <Image src={item.img12} alt={""}></Image>
                          <Image src={item.img13} alt={""}></Image>
                          <Image src={item.img14} alt={""}></Image>
                          <Image src={item.img15} alt={""}></Image>
                          <Image src={item.img16} alt={""}></Image>
                          <Image src={item.img17} alt={""}></Image>
                          <Image src={item.img18} alt={""}></Image>
                          <Image src={item.img19} alt={""}></Image>
                          <Image src={item.img20} alt={""}></Image>
                          <Image src={item.img21} alt={""}></Image>
                          <Image src={item.img22} alt={""}></Image>
                          <Image src={item.img23} alt={""}></Image>
                          <Image src={item.img24} alt={""}></Image>
                          <Image src={item.img25} alt={""}></Image>
                          <Image src={item.img26} alt={""}></Image>
                          <Image src={item.img27} alt={""}></Image>
                          <Image src={item.img28} alt={""}></Image>
                          <Image src={item.img29} alt={""}></Image>
                          <Image src={item.img30} alt={""}></Image>
                          <Image src={item.img31} alt={""}></Image>
                          <Image src={item.img32} alt={""}></Image>
                          <Image src={item.img33} alt={""}></Image>
                          <Image src={item.img34} alt={""}></Image>
                          <Image src={item.img35} alt={""}></Image>
                          <Image src={item.img36} alt={""}></Image>
                          <Image src={item.img37} alt={""}></Image>
                          <Image src={item.img38} alt={""}></Image>
                          <Image src={item.img39} alt={""}></Image>
                          <Image src={item.img40} alt={""}></Image>
                          <Image src={item.img41} alt={""}></Image>
                          <Image src={item.img42} alt={""}></Image>
                          <Image src={item.img43} alt={""}></Image>
                          <Image src={item.img44} alt={""}></Image>
                          <Image src={item.img45} alt={""}></Image>
                        </div>
                      </div>
                    ))}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
