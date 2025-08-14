
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
    </>
  );
};

export default TicketCard;
