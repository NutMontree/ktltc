const SectionTitle = ({
  subtitle,
  title,
  paragraph,
  width = "635px",
  center,
}: {
  subtitle?: string;
  title: string;
  paragraph: string;
  width?: string;
  center?: boolean;
}) => {
  return (
    <div className="-mx-4 flex flex-wrap">
      <div
        className={`wow fadeInUp w-full px-4 ${
          center ? "mx-auto text-center" : ""
        }`}
        data-wow-delay=".1s"
        style={{ maxWidth: width }}
      >
        {subtitle && (
          <span className="text-primary mb-2 block text-lg font-semibold">
            {subtitle}
          </span>
        )}
        <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl md:text-[40px] md:leading-[1.2] dark:text-white">
          {title}
        </h2>
        <p className="text-body-color dark:text-black-6 text-base leading-relaxed sm:leading-relaxed">
          {paragraph}
        </p>
      </div>
    </div>
  );
};

export default SectionTitle;
