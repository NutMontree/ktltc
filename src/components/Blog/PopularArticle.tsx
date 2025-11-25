import { Image } from "@heroui/image";
import Link from "next/link";

const PopularArticle = (props: {
  image: string;
  title: string;
  name: string;
}) => {
  const { image, title, name } = props;
  return (
    <div className="w-full md:w-1/2 lg:w-full">
      <div
        className="wow fadeInUp border-stroke dark:border-dark-3 mb-5 flex w-full items-center border-b pb-5"
        data-wow-delay=".1s"
      >
        <div className={`mr-5 overflow-hidden rounded`}>
          <Image
            src={image}
            alt="image"
            width={80}
            height={80}
            className="object-cover object-center"
          />
        </div>
        <div className="w-full">
          <h4>
            <Link
              href="/#"
              className="hover:text-primary dark:text-black-6 dark:hover:text-primary mb-1 inline-block text-lg leading-snug font-medium text-black lg:text-base xl:text-lg"
            >
              {title}
            </Link>
          </h4>
          <p className="text-body-color dark:text-black-6 text-sm">{name}</p>
        </div>
      </div>
    </div>
  );
};

export default PopularArticle;
