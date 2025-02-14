import { BackgroundGradient } from "@/components/ui/background-gradient";

export function ImgItem(props: { img: any; onImgClick: any }) {
  const { img, onImgClick } = props;
  return (
    <>
      <div className="scale-100   ">
        <BackgroundGradient className="rounded-[22px]   p-4 sm:p-4 bg-white dark:bg-zinc-900 ">
          <img
            className="flex"
            src={img.img}
            onClick={() => onImgClick(img)}
            alt={img.title.department}
          />
          <div className="text-center xl:text-lg text-black mt-4 mb-2 dark:text-neutral-200">
            <p>{img.title}</p>
          </div>
          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            <p>{img.secondary}</p>
            <p>{img.position}</p>
            <p>{img.department}</p>
            <p>{img.faction}</p>
            <p>{img.description}</p>
          </div>
        </BackgroundGradient>
      </div>
    </>
  );
}
