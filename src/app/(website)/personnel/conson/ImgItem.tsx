import { BackgroundGradient } from "@/components/ui/background-gradient";
import { UserOutlined } from "@ant-design/icons";

export function ImgItem(props: { img: any; onImgClick: any }) {
  const { img, onImgClick } = props;
  return (
    <>
      <div className="scale-100   ">
        <BackgroundGradient className="rounded-[22px]   p-4 sm:p-4 bg-white dark:bg-zinc-900 ">
          <div className="w-full aspect-3/4 overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center cursor-pointer" onClick={() => onImgClick(img)}>
            {img.img ? (
              <img
                className="w-full h-full object-cover object-top"
                src={img.img}
                alt={img.title}
              />
            ) : (
              <UserOutlined className="text-6xl text-slate-300 dark:text-zinc-700" />
            )}
          </div>
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
