import Pressrelease2566 from "./Pressrelease2566/Pressrelease2566";
import Pressrelease2567 from "./Pressrelease2567/Pressrelease2567";

export default function PressReleasePage() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl ">ข่าวประชาสัมพันธ์</h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] ">
          Press Release Page
        </h1>

        <Pressrelease2567 />
        <Pressrelease2566 />
      </div>
    </>
  );
}
