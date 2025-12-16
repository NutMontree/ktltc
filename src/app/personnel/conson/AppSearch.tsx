"use client";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

export const AppSearch = (props: { value: any; onValueChange: any }) => {
  const placeholders = [
    "ค้นหารายชื่อ ผู้บริหาร",
    "ค้นหารายชื่อ ครู ",
    "ค้นหารายชื่อ บุคลากรทางการศึกษา",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };

  const { value, onValueChange } = props;
  return (
    <>
      <div className="flex flex-col items-center justify-center py-8">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          // onChange={handleChange}
          onChange={(event) => onValueChange(event.target.value)}
          onSubmit={onSubmit}
        />
      </div>
    </>
  );
};
