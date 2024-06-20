import Pressrelease2566 from "../Pressrelease2566/page";
import Pressrelease2567 from "../Pressrelease2567/page";
export default function PressReleasePage() {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl ">ข่าวประชาสัมพันธ์</h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Press Release Page
        </h1>

        <div>
          <Pressrelease2567 />
        </div>

        <div>
          <Pressrelease2566 />
        </div>
      </div>
    </>
  );
}
