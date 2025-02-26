"use client"
import Link from "next/link";
import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";
import { Image } from "@nextui-org/react";

const Features = () => {
  return (
    <>
      <section className=" ">
        <div>
          <div className="relative z-20 overflow-hidden lg:pb-[30px] pt-[40px] lg:pt-[100px]">
            <div className="">
              <Link href='/GECC'>
                <SectionTitle
                  subtitle="GECC"
                  title="ศูนย์ราชการสะดวก"
                  paragraph="แถบนำทางเพื่อความสะดวกในการค้นหาข้อมูลของคุณ"
                />
                <Image src='/images/logo/GECCBG.webp' alt={"GECCBG"}></Image>

              </Link>
              <div className="-mx-4 mt-12 flex flex-wrap lg:mt-20">
                {featuresData.map((feature, i) => (
                  <SingleFeature key={i} feature={feature} />
                ))}
              </div>
            </div>
            <span className="absolute bottom-4 right-4 -z-[1]">
              <svg
                width="48"
                height="134"
                viewBox="0 0 48 134"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="45.6673"
                  cy="132"
                  r="1.66667"
                  transform="rotate(180 45.6673 132)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="117.333"
                  r="1.66667"
                  transform="rotate(180 45.6673 117.333)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="102.667"
                  r="1.66667"
                  transform="rotate(180 45.6673 102.667)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="88.0001"
                  r="1.66667"
                  transform="rotate(180 45.6673 88.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="73.3333"
                  r="1.66667"
                  transform="rotate(180 45.6673 73.3333)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="45.0001"
                  r="1.66667"
                  transform="rotate(180 45.6673 45.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="16.0001"
                  r="1.66667"
                  transform="rotate(180 45.6673 16.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="59.0001"
                  r="1.66667"
                  transform="rotate(180 45.6673 59.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="30.6668"
                  r="1.66667"
                  transform="rotate(180 45.6673 30.6668)"
                  fill="#3758F9"
                />
                <circle
                  cx="45.6673"
                  cy="1.66683"
                  r="1.66667"
                  transform="rotate(180 45.6673 1.66683)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0006"
                  cy="132"
                  r="1.66667"
                  transform="rotate(180 31.0006 132)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0006"
                  cy="117.333"
                  r="1.66667"
                  transform="rotate(180 31.0006 117.333)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0006"
                  cy="102.667"
                  r="1.66667"
                  transform="rotate(180 31.0006 102.667)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0006"
                  cy="88.0001"
                  r="1.66667"
                  transform="rotate(180 31.0006 88.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="73.3333"
                  r="1.66667"
                  transform="rotate(180 31.0008 73.3333)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="45.0001"
                  r="1.66667"
                  transform="rotate(180 31.0008 45.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="16.0001"
                  r="1.66667"
                  transform="rotate(180 31.0008 16.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="59.0001"
                  r="1.66667"
                  transform="rotate(180 31.0008 59.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="30.6668"
                  r="1.66667"
                  transform="rotate(180 31.0008 30.6668)"
                  fill="#3758F9"
                />
                <circle
                  cx="31.0008"
                  cy="1.66683"
                  r="1.66667"
                  transform="rotate(180 31.0008 1.66683)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3341"
                  cy="132"
                  r="1.66667"
                  transform="rotate(180 16.3341 132)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3341"
                  cy="117.333"
                  r="1.66667"
                  transform="rotate(180 16.3341 117.333)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3341"
                  cy="102.667"
                  r="1.66667"
                  transform="rotate(180 16.3341 102.667)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3341"
                  cy="88.0001"
                  r="1.66667"
                  transform="rotate(180 16.3341 88.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="73.3333"
                  r="1.66667"
                  transform="rotate(180 16.3338 73.3333)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="45.0001"
                  r="1.66667"
                  transform="rotate(180 16.3338 45.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="16.0001"
                  r="1.66667"
                  transform="rotate(180 16.3338 16.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="59.0001"
                  r="1.66667"
                  transform="rotate(180 16.3338 59.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="30.6668"
                  r="1.66667"
                  transform="rotate(180 16.3338 30.6668)"
                  fill="#3758F9"
                />
                <circle
                  cx="16.3338"
                  cy="1.66683"
                  r="1.66667"
                  transform="rotate(180 16.3338 1.66683)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="132"
                  r="1.66667"
                  transform="rotate(180 1.66732 132)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="117.333"
                  r="1.66667"
                  transform="rotate(180 1.66732 117.333)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="102.667"
                  r="1.66667"
                  transform="rotate(180 1.66732 102.667)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="88.0001"
                  r="1.66667"
                  transform="rotate(180 1.66732 88.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="73.3333"
                  r="1.66667"
                  transform="rotate(180 1.66732 73.3333)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="45.0001"
                  r="1.66667"
                  transform="rotate(180 1.66732 45.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="16.0001"
                  r="1.66667"
                  transform="rotate(180 1.66732 16.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="59.0001"
                  r="1.66667"
                  transform="rotate(180 1.66732 59.0001)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="30.6668"
                  r="1.66667"
                  transform="rotate(180 1.66732 30.6668)"
                  fill="#3758F9"
                />
                <circle
                  cx="1.66732"
                  cy="1.66683"
                  r="1.66667"
                  transform="rotate(180 1.66732 1.66683)"
                  fill="#3758F9"
                />
              </svg>
            </span>
          </div>
        </div>
      </section>
      {/* <section className="">
      </section> */}
    </>
  );
};

export default Features;
