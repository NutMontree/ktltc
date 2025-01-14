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
import { Data2 } from "./data";
import { Image } from "@nextui-org/react";

export default function Newsletter2() {
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
                    {Data2.Image.map((item) => (
                      <div key={item.title}>{item.title}</div>
                    ))}
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div>
                    {Data2.Image.map((item) => (
                      <div key={item.description1}>
                        {item.description1}
                        {item.description2}
                        <br />
                        {item.description3}
                      </div>
                    ))}
                  </div>

                  {Data2.Image.map((item) => (
                    <div key={item.backgroundImage1}>
                      <div>
                        <Image src={item.backgroundImage1} alt={""}></Image>
                        <Image src={item.backgroundImage2} alt={""}></Image>
                      </div>
                    </div>
                  ))}
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
