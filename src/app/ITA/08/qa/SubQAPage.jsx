// import TicketCard from "../../../(components)/TicketCard";
import TicketCard from "@/app/(components)/TicketCard";
import Backbrop from "./Backbrop";

import Link from "next/link";

const getTickets = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/Tickets", {
      // const res = await fetch("https://ktltc.vercel.app/api/Tickets", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch topics");
    }

    return res.json();
  } catch (error) {
    console.log("Error loading topics: ", error);
  }
};

export default async function SubQAPage() {
  const data = await getTickets();

  if (!data?.tickets) {
    return <p>No tickets.</p>;
  }

  const tickets = data.tickets;

  const uniqueCategories = [
    ...new Set(tickets?.map(({ category }) => category)),
  ];

  return (
    <>
      <div className="p-5">
        <div>
          <div className="text-xl font-bold">
            Q & A และช่องทางรับฟังความคิดเห็นวิทยาลัยเทคนิคกันทรลักษ์
          </div>
          {tickets &&
            uniqueCategories.map((uniqueCategory, categoryIndex) => (
              <div
                key={categoryIndex}
                className="hover:bg-card-hover bg-card m-2 flex flex-col rounded-2xl p-3 shadow-lg"
              >
                <div className="grid grid-cols-2">
                  <div className="flex justify-start">
                    <img
                      src="/images/ita/avatar.webp"
                      alt="avatar"
                      className="w-14 p-2"
                    />
                    <div className="pt-4">{uniqueCategory}</div>
                  </div>
                </div>
                <div className=" ">
                  {tickets
                    .filter((ticket) => ticket.category === uniqueCategory)
                    .map((filteredTicket, index) => (
                      <TicketCard
                        id={filteredTicket.id}
                        key={filteredTicket.id}
                        ticket={filteredTicket}
                      />
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      <Link href="/TicketPage/new">
        <div className="flex px-12">
          <div className="flex gap-2">
            <p className="rounded-full border bg-gray-200 px-3 pb-1 text-2xl text-gray-500 hover:bg-gray-300 hover:text-gray-600">
              +
            </p>
            <p className="pt-2 hover:text-gray-500"> Add Comments</p>
          </div>
        </div>
      </Link>

      <Backbrop />
    </>
  );
}
