import { Feature } from "@/types/feature";
import Link from "next/link";

const SingleFeature = ({ feature }: { feature: Feature }) => {
  const { icon, title, paragraph, btn, btnLink } = feature;
  return (
    <div className="w-1/2 px-8 md:w-1/3 lg:w-1/4 xl:w-1/5">
      <div className="wow fadeInUp group mb-12" data-wow-delay=".15s">
        <Link
          href={btnLink}
          className="hover:text-primary dark:hover:text-primary text-base font-medium text-black dark:text-white"
        >
          <div className="bg-primary relative z-10 mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-2xl">
            <span className="bg-primary bg-opacity-20 absolute top-0 left-0 z-[-1] mb-8 flex h-[70px] w-[70px] rotate-[25deg] items-center justify-center rounded-2xl duration-300 group-hover:rotate-45"></span>
            {icon}
          </div>
          <h3 className="mb-3 text-xl font-bold text-black dark:text-white">
            {title}
          </h3>
          <p className="text-body-color dark:text-black-6 mb-8 lg:mb-11">
            {paragraph}
          </p>
          {btn}
        </Link>
      </div>
    </div>
  );
};

export default SingleFeature;
