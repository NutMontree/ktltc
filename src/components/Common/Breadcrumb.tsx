import Link from "next/link";

const Breadcrumb = ({
  pageName,
  pageDescription,
}: {
  pageName: string;
  pageDescription?: string;
}) => {
  return (
    <>
      {/* <div className="dark:bg-dark relative z-10 overflow-hidden pb-[60px] pt-[120px] md:pt-[130px] lg:pt-40"> */}
      <div className="dark:bg-dark relative z-10 overflow-hidden pt-[100px] pb-[60px]">
        <div className="from-stroke/0 via-stroke to-stroke/0 absolute bottom-0 left-0 h-px w-full bg-linear-to-r"></div>
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full">
              <div className="text-center">
                <h1 className="mb-4 text-3xl font-bold text-black sm:text-4xl md:text-[40px] md:leading-[1.2] dark:text-white">
                  {pageName}
                </h1>
                <p className="text-body-color dark:text-black-6 mb-5 text-base">
                  {pageDescription}
                </p>

                <ul className="flex items-center justify-center gap-2.5">
                  <li>
                    <Link
                      href="/"
                      className="flex items-center gap-2.5 text-base font-medium text-black dark:text-white"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <p className="text-body-color flex items-center gap-2.5 text-base font-medium">
                      <span className="text-body-color dark:text-black-6">
                        {" "}
                        /{" "}
                      </span>
                      {pageName}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Breadcrumb;
