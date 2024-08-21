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
                            href="https://www.facebook.com/messages/t/61553558543619?locale=hi_IN"
                          >
                            <Avatar
                              src="https://scontent.fbkk10-1.fna.fbcdn.net/v/t39.30808-6/455241879_122158260428118618_1989508605048075991_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=5vJ2NuR9MFgQ7kNvgEqxw86&_nc_ht=scontent.fbkk10-1.fna&oh=00_AYD1Nw_rYEWIAevJKVrIjr9egqxaWV0suaZkx90GDzyJtw&oe=66CB6341"
                              className="w-20 h-20 text-large"
                            />
                          </Link>
                        </div>

                        <div className="flex gap-2 flex justify-center">
                          <div>All M Min </div>
                          <Link
                            className="text-sky-500"
                            href="https://www.facebook.com/messages/t/61553558543619?locale=hi_IN"
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
