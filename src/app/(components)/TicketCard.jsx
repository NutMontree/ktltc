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
      <div className="m-2 flex flex-col border-b p-2">
        {/* <DeleteBlock id={ticket._id} /> */}
        <div className="text-xl font-bold">{ticket.title}</div>
        <div className="whitespace-pre-wrap">{ticket.description}</div>
        <div className="flex flex-col">
          <p className="my-1 text-xs">{createdDateTime}</p>
        </div>
      </div>
    </>
  );
};

export default TicketCard;
