import { UserOutlined } from "@ant-design/icons";

export const ImgPost = (props: { img: any; onBgClick: any }) => {
  const { img, onBgClick } = props;
  return (
    <div className="img-post">
      <div className="img-bg" onClick={onBgClick} />
      <div className="img-content w-full flex flex-col items-center">
        {img.fullUrl ? (
          <img src={img.fullUrl} alt={img.title} className="max-h-[70vh] object-contain rounded-xl" />
        ) : (
          <div className="w-full max-w-sm aspect-square bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
            <UserOutlined className="text-8xl text-slate-300 dark:text-zinc-700" />
          </div>
        )}
        <h3 className="mt-4 text-2xl font-bold">{img.title}</h3>
      </div>
    </div>
  );
};
