export const lines = [
  "Call God; I have seen one of his angels here on earth.",
  "Gosh! My screen just froze at the sight of you.",
];

export const getRandomLine = () => {
  const randomIndex = Math.floor(Math.random() * lines.length);
  return lines[randomIndex];
};
