import StatusDisplay from "./StatusDisplay";
import PriorityDisplay from "./PriorityDisplay";
import DeleteBlock from "./DeleteBlock";
import ProgressDisplay from "./ProgressDisplay";
import Link from "next/link";

const TicketCard = ({ ticket }) => {
  function formatTimestamp(timestamp) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const date = new Date(timestamp);
    const formattedDate = date.toLocaleString("en-US", options);

    return formattedDate;
  }

  const createdDateTime = formatTimestamp(ticket.createdAt);

  return (
    <>
      <div className="flex flex-col p-2 m-2 border-b">
        {/* <DeleteBlock id={ticket._id} /> */}
        <div className="font-bold text-xl">{ticket.title}</div>
        <div className="whitespace-pre-wrap">{ticket.description}</div>
        <div className="flex flex-col">
          <p className="text-xs  my-1">{createdDateTime}</p>
        </div>
      </div>
      {/* <div className="flex flex-col hover:bg-card-hover bg-card rounded-2xl shadow-lg p-3 m-2">
      <div className="flex mb-3">
        <PriorityDisplay priority={ticket.priority} />
        <div className="ml-auto">
          <DeleteBlock id={ticket._id} />
        </div>
      </div>
      <Link href={`/TicketPage/${ticket._id}`} style={{ display: "contents" }}>
        <div className="mb-1 flex">
          <img src="avatar.webp" alt="avatar" className="p-2 w-14" />
          <div className="pt-4">{ticket.title}</div>
        </div>
        <hr className="h-px  border-0 bg-page mb-2 "></hr>
        <p className="whitespace-pre-wrap">{ticket.description}</p>

        <div className="flex-grow"></div>
        <div className="flex mt-2">
          <div className="flex flex-col">
            <p className="text-xs  my-1">{createdDateTime}</p>
            <ProgressDisplay progress={ticket.progress} />
          </div>
          <div className="ml-auto  flex items-end">
            <StatusDisplay status={ticket.status} />
          </div>
        </div>
      </Link>
    </div> */}
    </>
  );
};

export default TicketCard;
