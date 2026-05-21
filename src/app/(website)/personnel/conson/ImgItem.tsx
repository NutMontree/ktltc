import { BackgroundGradient } from "@/components/ui/background-gradient";
import { UserOutlined, PhoneOutlined, MailOutlined, MessageOutlined } from "@ant-design/icons";

export function ImgItem(props: { img: any; onImgClick: any }) {
  const { img, onImgClick } = props;
  return (
    <>
      <div className="scale-100 flex flex-col h-full">
        <BackgroundGradient className="rounded-[22px] p-4 bg-white dark:bg-zinc-900 flex flex-col h-full justify-between">
          <div>
            <div className="w-full aspect-square overflow-hidden rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/50 flex items-center justify-center cursor-pointer" onClick={() => onImgClick(img)}>
              {img.img ? (
                <img
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  src={img.img}
                  alt={img.title}
                />
              ) : (
                <UserOutlined className="text-6xl text-slate-300 dark:text-zinc-700" />
              )}
            </div>
            <div className="text-center xl:text-lg text-black mt-4 mb-2 dark:text-neutral-200 font-bold">
              <p>{img.title}</p>
            </div>
            <div className="text-center text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              {img.secondary && <p className="font-semibold text-amber-600 dark:text-amber-400">{img.secondary}</p>}
              {img.position && <p>{img.position}</p>}
              {img.department && <p className="text-xs opacity-75">{img.department}</p>}
              {img.faction && <p className="text-xs opacity-60 italic">{img.faction}</p>}
              {img.description && <p className="text-xs opacity-60 line-clamp-2">{img.description}</p>}
            </div>
          </div>

          {/* Contact Channels */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
            {img.phone ? (
              <p className="flex items-center gap-2">
                <PhoneOutlined className="text-amber-500 shrink-0" />
                <span className="font-bold">โทร:</span> <a href={`tel:${img.phone}`} className="hover:underline">{img.phone}</a>
              </p>
            ) : null}
            {img.email ? (
              <p className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                <MailOutlined className="text-amber-500 shrink-0" />
                <span className="font-bold">อีเมล:</span> <span className="truncate">{img.email}</span>
              </p>
            ) : null}
            {img.lineId ? (
              <p className="flex items-center gap-2">
                <MessageOutlined className="text-amber-500 shrink-0" />
                <span className="font-bold">Line:</span> <span>{img.lineId}</span>
              </p>
            ) : null}
            {!img.phone && !img.email && !img.lineId && (
              <p className="flex items-center gap-2 opacity-75">
                <MailOutlined className="text-amber-500 shrink-0" />
                <span className="font-bold">ติดต่อวิทยาลัย:</span> <span>info@ktltc.ac.th</span>
              </p>
            )}
          </div>
        </BackgroundGradient>
      </div>
    </>
  );
}
