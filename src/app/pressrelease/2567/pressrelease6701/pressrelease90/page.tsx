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
import { DataDate, DataPressrelease, Description, ImageItem } from "./data";
import { Image } from "@nextui-org/react";
import Link from "next/link";

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
          c
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div>
                    {DataPressrelease.Item.map((item) => (
                      <div key={item.title}>{item.title}</div>
                    ))}
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div>
                    {Description.map((item) => (
                      <div key={item.description}>
                        <div>{item.description}</div>
                      </div>
                    ))}
                  </div>
                  {DataDate.map((item) => (
                    <div key={item.date}>
                      <div className="text-xs text-slate-500">{item.date}</div>
                    </div>
                  ))}
                  <div>
                    <Link
                      className="text-lg text-sky-500"
                      href="https://forms.gle/oBfcSbV3so6Ks5w59"
                    >
                      {/* รูปภาพเพิ่มเติม */}
                      ลิ้งค์สมัคร
                    </Link>
                  </div>
                  <div className="justify-center flex-col">
                    {ImageItem.map((item) => (
                      <div
                        className="mb-4 group relative shadow-lg rounded-xl px-[144px] py-[144px]"
                        key={item.img}
                      >
                        <div className="absolute inset-0 bg-cover bg-center rounded-xl hover:scale-110 transition duration-500 cursor-pointer object-cover">
                          <Image src={item.img} alt={""}></Image>
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
