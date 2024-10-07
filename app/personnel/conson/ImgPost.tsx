/* eslint-disable @typescript-eslint/no-explicit-any */

export const ImgPost = (props: { img: any; onBgClick: any }) => {
  const { img, onBgClick } = props;
  return (
    <div className="img-post">
      <div className="img-bg" onClick={onBgClick} />
      <div className="img-content">
        <img src={img.fullUrl} alt={img.title} />
        <h3>{img.title}</h3>
      </div>
    </div>
  );
};
