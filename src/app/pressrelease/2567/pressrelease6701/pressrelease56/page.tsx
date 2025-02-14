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
import { DataPressrelease } from "./data";
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
                    {DataPressrelease.Item.map((item) => (
                      <div key={item.description}>
                        <div>{item.description}</div>

                        <div className="text-xs text-slate-500">
                          {item.date}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <iframe
                      className="w-full aspect-video ..."
                      src="/images/ข่าวประชาสัมพันธ์/2567/มกราคม/39/5.mp4"
                    />
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
