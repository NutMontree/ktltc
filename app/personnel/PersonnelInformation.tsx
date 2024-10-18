"use client";

import { SetStateAction, useState } from "react";
import { AppSearch } from "./conson/AppSearch";
import { ImgItem } from "./conson/ImgItem";
import { ImgPost } from "./conson/ImgPost";
import { imgs } from "./data";

export const Personnel1 = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [searchText, setSearchText] = useState("");

  function onImgOpenClick(img: SetStateAction<null>) {
    setSelectedImg(img);
  }

  function onImgCloseClick() {
    setSelectedImg(null);
  }

  const imgItems = imgs
    .filter((img) => {
      return img.title.includes(searchText);
    })
    .map((img, index) => {
      return <ImgItem key={index} img={img} onImgClick={onImgOpenClick} />;
    });

  let imgPost = null;
  if (selectedImg) {
    imgPost = <ImgPost img={selectedImg} onBgClick={onImgCloseClick} />;
  }

  return (
    <div className="app">
      <section className="app-section">
        <div className="app-container">
          <AppSearch value={searchText} onValueChange={setSearchText} />
          <div className="pt-[48px] ">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 py-4 ">
              {imgItems}
            </div>
          </div>
        </div>
      </section>
      {imgPost}
    </div>
  );
};

export default function PersonnelInformation() {
  return (
    <>
      <div className="py-[46px] ">
        <Personnel1 />
      </div>
    </>
  );
}
