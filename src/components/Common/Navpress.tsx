import Link from "next/link";

const Navpress = ({
    pageName,
    pageDescription,
}: {
    pageName: string;
    pageDescription?: string;
}) => {
    return (
        <>
            {/* <div className="dark:bg-dark relative z-10 overflow-hidden pb-[60px] pt-[120px] md:pt-[130px] lg:pt-[160px]"> */}
            <div className="dark:bg-dark relative z-10 overflow-hidden pb-[60px] pt-[100px] ">
                <div className="from-stroke/0 via-stroke to-stroke/0 dark:via-dark-3 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r"></div>
                <div className="container">
                    <div className="-mx-4 flex flex-wrap items-center">
                        <div className="w-full px-4">
                            <div className="text-center">
                                <div>
                                    <h1 className="flex justify-center text-xl ">ข่าวประชาสัมพันธ์</h1>
                                    <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
                                        Press Release Page
                                    </h1>
                                </div>
                                <p className="text-body-color dark:text-dark-6 mb-5 text-base">
                                    {pageDescription}
                                </p>

                                <ul className="flex items-center justify-center gap-[10px]">
                                    <li>
                                        <Link
                                            href="/pressrelease"
                                            className="text-dark flex items-center gap-[10px] text-base font-medium dark:text-white"
                                        >
                                            PressRelease
                                        </Link>
                                    </li>
                                    <li>
                                        <p className="text-body-color flex items-center gap-[10px] text-base font-medium">
                                            <span className="text-body-color dark:text-dark-6">
                                                /
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

export default Navpress;
