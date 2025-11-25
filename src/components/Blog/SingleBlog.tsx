import { Blog } from "@/types/blog";
import { format } from "date-fns";
import { Image } from "@heroui/image";
import Link from "next/link";

const SingleBlog = ({ blog }: { blog: Blog }) => {
  const { title, coverImage, excerpt, date, slug } = blog;

  return (
    <div className="wow fadeInUp group mb-10" data-wow-delay=".1s">
      <div className="mb-8 overflow-hidden rounded">
        <Link href={`/blogs/${slug}`} aria-label="blog cover" className="block">
          <Image
            src={coverImage!}
            alt="image"
            className="w-full transition group-hover:scale-125 group-hover:rotate-6"
            width={408}
            height={272}
          />
        </Link>
      </div>
      <div>
        <span className="bg-primary mb-5 inline-block rounded px-4 py-1 text-center text-xs leading-loose font-semibold text-white">
          {format(new Date(date), "dd MMM yyyy")}
        </span>
        <h3>
          <Link
            href={`/blogs/${slug}`}
            className="hover:text-primary dark:hover:text-primary mb-4 inline-block text-xl font-semibold text-black sm:text-2xl lg:text-xl xl:text-2xl dark:text-white"
          >
            {title}
          </Link>
        </h3>
        <p className="text-body-color dark:text-black-6 text-base">{excerpt}</p>
      </div>
    </div>
  );
};

export default SingleBlog;
