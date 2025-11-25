import axios from "axios";
import React from "react";
import OfferList from "./OfferList";
import { Price } from "@/types/price";

const PricingBox = ({ product }: { product: Price }) => {
  // POST request
  const handleSubscription = async (e: any) => {
    e.preventDefault();
    const { data } = await axios.post(
      "/api/payment",
      {
        priceId: product.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    window.location.assign(data);
  };

  return (
    <div className="w-full md:w-1/2 lg:w-1/3">
      <div
        className="dark:bg-dark-2 relative z-10 mb-10 overflow-hidden rounded-xl bg-white px-8 py-10 shadow-[0px_0px_40px_0px_rgba(0,0,0,0.08)] sm:p-12 lg:px-6 lg:py-10 xl:p-14"
        data-wow-delay=".1s"
      >
        {product.nickname === "Premium" && (
          <p className="bg-primary absolute top-[60px] right-[-50px] inline-block -rotate-90 rounded-tl-md rounded-bl-md px-5 py-2 text-base font-medium text-white">
            Recommended
          </p>
        )}
        <span className="mb-5 block text-xl font-medium text-black dark:text-white">
          {product.nickname}
        </span>
        <h2 className="mb-11 text-4xl font-semibold text-black xl:text-[42px] xl:leading-[1.21] dark:text-white">
          <span className="text-xl font-medium">$ </span>
          <span className="-tracking-0.5 -ml-1">
            {(product.unit_amount / 100).toLocaleString("en-US", {
              currency: "USD",
            })}
          </span>
          <span className="text-body-color dark:text-black-6 text-base font-normal">
            {" "}
            Per Month
          </span>
        </h2>

        <div className="mb-[50px]">
          <h3 className="mb-5 text-lg font-medium text-black dark:text-white">
            Features
          </h3>
          <div className="mb-10">
            {product?.offers.map((offer, i) => (
              <OfferList key={i} text={offer} />
            ))}
          </div>
        </div>
        <div className="w-full">
          <button
            onClick={handleSubscription}
            className="bg-primary hover:bg-primary/90 inline-block rounded-md px-7 py-3 text-center text-base font-medium text-white transition duration-300"
          >
            Purchase Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingBox;
