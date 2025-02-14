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
  Avatar,
} from "@nextui-org/react";
import Link from "next/link";

export default function Sponsor() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div className="py-72">
        <div>
          <h1 className="text-xl text-[#DAA520] text-center">No Sponsors</h1>
          <div className="text-center" text-center>
            Will You Be My Sponsor
          </div>
          <div className=" flex justify-center py-8 gap-2">
            <div>
              <Button
                onPress={onOpen}
                radius="full"
                color="primary"
                variant="shadow"
              >
                Add Sponsor
              </Button>
              <Modal
                backdrop="opaque"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                classNames={{
                  backdrop:
                    "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20  ",
                }}
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Add Sponsor
                      </ModalHeader>
                      <ModalBody>
                        <div>สามารถติดต่อขอเป็น Sponsor ได้ที่</div>
                        <div className=" justify-center flex">
                          <Link
                            className="text-sky-500"
                            href="https://www.facebook.com/profile.php?id=61553558543619&locale=hi_IN"
                            target="_blank"
                          >
                            <Avatar
                              src="/images/admin1.webp"
                              className="w-20 h-20 text-large"
                            />
                          </Link>
                        </div>

                        <div className="flex gap-2 justify-center">
                          <div>All M Min </div>
                          <Link
                            className="hover:text-sky-700 text-sky-500 "
                            href="https://www.facebook.com/messages/t/61553558543619?locale=hi_IN"
                            target="_blank"
                          >
                            Messages
                          </Link>
                        </div>

                        <div className="flex justify-center">
                          <iframe
                            className=" h-[250px] w-[142px] "
                            src="/images/5.gif"
                          ></iframe>
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Esc
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
