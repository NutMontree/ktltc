const OfferList = ({ text }: { text: string }) => {
  return (
    <p className={`text-body-color dark:text-black-6 mb-1 text-base`}>{text}</p>
  );
};

export default OfferList;
