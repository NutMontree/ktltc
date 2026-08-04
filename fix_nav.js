const fs = require("fs");
let data = fs.readFileSync("d:\\ktltc\\src\\components\\NavbarClient.tsx", "utf8");

const regex =
  /<nav className="relative w-full max-w-\[1600px\] mx-auto bg-white\/65 dark:bg-zinc-950\/65 backdrop-blur-2xl shadow-\[0_8px_32px_rgba\(0,0,0,0\.08\)\] dark:shadow-\[0_8px_32px_rgba\(0,0,0,0\.4\)\] rounded-\[28px\] border border-zinc-200\/70 dark:border-zinc-800\/60 py-2 px-4 sm:px-6 ring-1 ring-black\/5 dark:ring-white\/5 transition-all duration-300">[\s\S]*?<GlassSurface width="100%" height="100%" borderRadius={28} \/>[\s\S]*?<\/div>/;

const replacement = `<nav className="relative w-full max-w-[1600px] mx-auto bg-white/10 dark:bg-zinc-950/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-[28px] border border-white/40 dark:border-zinc-800/60 py-2 px-4 sm:px-6 ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300" style={{ WebkitBackdropFilter: "blur(40px)" }}>`;

if (regex.test(data)) {
  data = data.replace(regex, replacement);
  fs.writeFileSync("d:\\ktltc\\src\\components\\NavbarClient.tsx", data, "utf8");
  console.log("SUCCESS");
} else {
  console.log("FAILED_TO_MATCH");
}
