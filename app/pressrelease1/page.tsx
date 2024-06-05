/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable jsx-a11y/alt-text */
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
import { DatatPressrelease1 } from "./data";
import { Image } from "@nextui-org/react";

export default function Pressrelease1() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [scrollBehavior, setScrollBehavior] = React.useState("inside");
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
                    {DatatPressrelease1.Item.map((item) => (
                      <div key={item.title}>{item.title}</div>
                    ))}
                  </div>
                </ModalHeader>
                <ModalBody>
                  <p>
                    {DatatPressrelease1.Item.map((item) => (
                      <div key={item.description}>
                        <div>{item.description}</div>
                        <div className="text-xs text-slate-500">
                          {item.date}
                        </div>
                      </div>
                    ))}
                  </p>
                  <div></div>

                  <div className="">
                    {DatatPressrelease1.Item.map((item) => (
                      <div key={item.img1}>
                        <div>
                          <Image
                            className="grid gap-4 grid-cols-2"
                            src={item.img1}
                            alt={""}
                          ></Image>
                          <Image
                            className="grid gap-4 grid-cols-2"
                            src={item.img2}
                            alt={""}
                          ></Image>
                          <Image
                            className="grid gap-4 grid-cols-2"
                            src={item.img3}
                            alt={""}
                          ></Image>
                          <Image
                            className="grid gap-4 grid-cols-2"
                            src={item.img4}
                            alt={""}
                          ></Image>
                          <Image
                            className="grid gap-4 grid-cols-2"
                            src={item.img5}
                            alt={""}
                          ></Image>
                          <Image
                            className="grid gap-4 grid-cols-2"
                            src={item.img6}
                            alt={""}
                          ></Image>
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
