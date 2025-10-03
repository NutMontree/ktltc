import Phone from "./phone";
import Mail from "./mail";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";

export default function TopHeader() {
  return (
    <>
      <div className="px-24 min-w-24 flex justify-end">
        <ul>
          <div className="flex gap-4 text-xs">
            <div>ติดต่อสอบถาม</div>

            <div className="flex">
              <Popover
                showArrow
                offset={10}
                placement="bottom"
                motionProps={{
                  variants: {
                    enter: {
                      y: 0,
                      opacity: 1,

                      transition: {
                        opacity: {
                          duration: 0.15,
                        },
                      },
                    },
                    exit: {
                      y: "10%",
                      opacity: 0,

                      transition: {
                        opacity: {
                          duration: 0.1,
                        },
                      },
                    },
                  },
                }}
              >
                <PopoverTrigger>
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                      />
                    </svg>
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="px-1 py-2">
                    <div className="text-tiny">061-4122765 หรือ 045-811053</div>
                  </div>
                </PopoverContent>
              </Popover>
              <Phone />
            </div>

            <div className="flex">
              <Popover
                showArrow
                offset={10}
                placement="bottom"
                motionProps={{
                  variants: {
                    enter: {
                      y: 0,
                      opacity: 1,

                      transition: {
                        opacity: {
                          duration: 0.15,
                        },
                      },
                    },
                    exit: {
                      y: "10%",
                      opacity: 0,

                      transition: {
                        opacity: {
                          duration: 0.1,
                        },
                      },
                    },
                  },
                }}
              >
                <PopoverTrigger>
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="px-1 py-2">
                    <div className="text-tiny">relationktl@gmail.com</div>
                  </div>
                </PopoverContent>
              </Popover>
              <Mail />
            </div>
          </div>
        </ul>
      </div>
    </>
  );
}
