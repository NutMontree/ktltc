import type { ISourceOptions } from "@tsparticles/engine";

export const getEffectConfig = (effectId: string): ISourceOptions => {
  const baseConfig: ISourceOptions = {
    fullScreen: { enable: true, zIndex: 9999 },
    detectRetina: true,
  };

  const emojiConfig = (emojis: string | string[], speed = 2, size = 20, count = 30, direction: any = "bottom", noRotateWobble = false): ISourceOptions => ({
    ...baseConfig,
    particles: {
      number: { value: count },
      shape: {
        type: "character",
        options: { character: { value: emojis, font: "Verdana" } },
      },
      opacity: { value: 1 },
      size: { value: size },
      move: { enable: true, speed, direction, straight: noRotateWobble },
      ...(noRotateWobble ? {} : { wobble: { enable: true, distance: 10, speed: 5 } }),
      rotate: noRotateWobble ? { value: 0 } : { value: { min: 0, max: 360 }, animation: { enable: true, speed: 5 } },
    },
  });

  const simpleParticle = (color: string | string[], count = 50, speed = 2, size = 3, direction: any = "none"): ISourceOptions => ({
    ...baseConfig,
    particles: {
      number: { value: count },
      color: { value: color },
      shape: { type: "circle" },
      opacity: { value: { min: 0.1, max: 1 }, animation: { enable: true, speed: 1, sync: false } },
      size: { value: { min: 1, max: size } },
      move: { enable: true, speed, direction, straight: false },
    },
  });

  switch (effectId) {
    // ------------------------------------
    // WEATHER & NATURE (1-15)
    // ------------------------------------
    case "snow":
      return {
        ...baseConfig,
        particles: {
          number: { value: 100, density: { enable: true } },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: { min: 0.3, max: 0.8 } },
          size: { value: { min: 1, max: 5 } },
          move: { enable: true, speed: 2, direction: "bottom", straight: false },
          wobble: { enable: true, distance: 5, speed: 2 },
        },
      };
    case "rain":
      return {
        ...baseConfig,
        particles: {
          number: { value: 150, density: { enable: true } },
          color: { value: "#a0aec0" },
          shape: { type: "circle" },
          opacity: { value: 0.5 },
          size: { value: 2 },
          move: { enable: true, speed: 20, direction: "bottom", straight: true },
        },
      };
    case "sunlight":
      return simpleParticle("#fcd34d", 40, 1, 15, "top");
    case "tornado":
      return {
        ...baseConfig,
        particles: {
          number: { value: 100 },
          color: { value: ["#a3a3a3", "#737373", "#525252"] },
          shape: { type: "circle" },
          opacity: { value: 0.5 },
          size: { value: 2 },
          move: { enable: true, speed: 10, direction: "none", spin: { enable: true, acceleration: 5 } },
        },
      };
    case "sandstorm":
      return {
        ...baseConfig,
        particles: {
          number: { value: 150 },
          color: { value: "#d97706" },
          shape: { type: "circle" },
          opacity: { value: { min: 0.1, max: 0.5 } },
          size: { value: 2 },
          move: { enable: true, speed: 25, direction: "right", straight: true },
        },
      };
    case "thunderstorm":
      return {
        ...baseConfig,
        particles: {
          number: { value: 100 },
          color: { value: "#3b82f6" },
          shape: { type: "circle" },
          opacity: { value: 0.8 },
          size: { value: 3 },
          move: { enable: true, speed: 30, direction: "bottom", straight: true },
        },
      };
    case "dandelion":
      return emojiConfig("🌾", 1, 15, 30, "top-right");
    case "pine_trees":
      return emojiConfig("🌲", 3, 20, 20);
    case "roses":
      return emojiConfig("🌹", 2, 25, 25);
    case "sunflowers":
      return emojiConfig("🌻", 1.5, 25, 20);
    case "clover":
      return emojiConfig("🍀", 2, 20, 30);
    case "waterdrops":
      return emojiConfig("💧", 5, 15, 40, "bottom", true);
    case "rainbows":
      return {
        ...baseConfig,
        particles: {
          number: { value: 80 },
          color: {
            value: ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"],
            animation: { enable: true, speed: 50, sync: false },
          },
          shape: { type: "circle" },
          opacity: { value: 0.6 },
          size: { value: { min: 10, max: 30 } },
          move: {
            enable: true,
            speed: 3,
            direction: "none",
            random: true,
            straight: false,
            outModes: "bounce",
          },
          links: {
            enable: true,
            distance: 150,
            color: "random",
            opacity: 0.5,
            width: 2,
          },
        },
      };
    case "fog":
      return simpleParticle("#cbd5e1", 20, 1, 200, "right");
    case "autumn":
      return emojiConfig(["🍂", "🍁"], 2, 20, 40);

    // ------------------------------------
    // SPACE & SCI-FI (16-30)
    // ------------------------------------
    case "stars":
      return {
        ...baseConfig,
        particles: {
          number: { value: 100 },
          color: { value: "#ffffff" },
          shape: { type: "star" },
          opacity: { value: { min: 0.1, max: 1 }, animation: { enable: true, speed: 1, sync: false } },
          size: { value: { min: 1, max: 3 } },
          move: { enable: true, speed: 0.5, direction: "none", straight: false },
        },
      };
    case "nebula":
      return {
        ...baseConfig,
        particles: {
          number: { value: 30 },
          color: { value: ["#3b82f6", "#8b5cf6", "#ec4899"] },
          shape: { type: "circle" },
          opacity: { value: { min: 0.05, max: 0.2 } },
          size: { value: { min: 50, max: 150 } },
          move: { enable: true, speed: 0.5, direction: "none", random: true },
          filter: { blur: { value: 10 } },
        },
      };
    case "comets":
      return emojiConfig("☄️", 15, 25, 10, "bottom-left", true);
    case "moons":
      return emojiConfig(["🌙", "🌛", "🌜"], 1, 30, 10, "none");
    case "planets":
      return emojiConfig(["🪐", "🌍", "🌎", "🌏"], 1, 40, 10, "none");
    case "aliens":
      return emojiConfig(["👽", "🛸"], 2, 25, 15, "none");
    case "rockets":
      return emojiConfig("🚀", 8, 30, 10, "top");
    case "matrix":
      return {
        ...baseConfig,
        particles: {
          number: { value: 100 },
          color: { value: "#22c55e" },
          shape: { type: "character", options: { character: { value: ["0", "1"], font: "monospace", weight: "bold" } } },
          opacity: { value: { min: 0.1, max: 1 } },
          size: { value: 14 },
          move: { enable: true, speed: 10, direction: "bottom", straight: true },
        },
      };
    case "cyberpunk":
      return {
        ...baseConfig,
        particles: {
          number: { value: 80 },
          color: { value: ["#0ff", "#f0f", "#ff0"] },
          shape: { type: "square" },
          opacity: { value: 0.8 },
          size: { value: 4 },
          move: { enable: true, speed: 15, direction: "bottom", straight: true, trail: { enable: true, length: 10, fill: { color: "#000" } } },
        },
      };
    case "lasers":
      return {
        ...baseConfig,
        particles: {
          number: { value: 30 },
          color: { value: ["#ff0000", "#00ff00", "#0000ff"] },
          shape: { type: "character", options: { character: { value: "-" } } },
          opacity: { value: 1 },
          size: { value: { min: 20, max: 40 } },
          move: { enable: true, speed: 50, direction: "right", straight: true },
        },
      };
    case "meteor_shower":
      return {
        ...baseConfig,
        particles: {
          number: { value: 40 },
          color: { value: "#ffffff" },
          shape: { type: "character", options: { character: { value: "/" } } },
          opacity: { value: 1 },
          size: { value: { min: 15, max: 30 } },
          move: { enable: true, speed: 30, direction: "bottom-left", straight: true },
        },
      };
    case "blackhole":
      return {
        ...baseConfig,
        particles: {
          number: { value: 200 },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: 0.8 },
          size: { value: 2 },
          move: { enable: true, speed: 5, attract: { enable: true, rotate: { x: 2000, y: 2000 } } },
        },
      };
    case "magic":
      return {
        ...baseConfig,
        particles: {
          number: { value: 60 },
          color: { value: ["#a855f7", "#3b82f6", "#ec4899"] },
          shape: { type: "star" },
          opacity: { value: { min: 0, max: 1 }, animation: { enable: true, speed: 2, sync: false } },
          size: { value: { min: 2, max: 6 } },
          move: { enable: true, speed: 1.5, direction: "none", random: true },
        },
      };
    case "speed_lines":
      return {
        ...baseConfig,
        particles: {
          number: { value: 100 },
          color: { value: "#ffffff" },
          shape: { type: "character", options: { character: { value: "|" } } },
          opacity: { value: 0.5 },
          size: { value: { min: 30, max: 60 } },
          move: { enable: true, speed: 50, direction: "bottom", straight: true },
        },
      };
    case "yin_yang":
      return emojiConfig("☯️", 1, 30, 20, "none");

    // ------------------------------------
    // PARTY & HOLIDAYS (31-45)
    // ------------------------------------
    case "fireworks":
      return {
        ...baseConfig,
        particles: {
          number: { value: 0 },
          color: { value: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"] },
          shape: { type: "circle" },
          opacity: { value: 1, animation: { enable: true, speed: 1, startValue: "max", destroy: "min" } },
          size: { value: { min: 2, max: 4 } },
          life: { duration: { sync: true, value: 1.5 }, count: 1 },
          move: { enable: true, gravity: { enable: true, acceleration: 9.8 }, speed: 15, direction: "none", outModes: "destroy" },
        },
        emitters: [
          { direction: "none", rate: { delay: 1.5, quantity: 80 }, position: { x: 30, y: 30 }, size: { width: 0, height: 0 } },
          { direction: "none", rate: { delay: 2, quantity: 80 }, position: { x: 70, y: 40 }, size: { width: 0, height: 0 } },
          { direction: "none", rate: { delay: 1.8, quantity: 80 }, position: { x: 50, y: 20 }, size: { width: 0, height: 0 } },
        ],
      };
    case "bubbles":
      return {
        ...baseConfig,
        particles: {
          number: { value: 30 },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: { min: 0.1, max: 0.4 } },
          size: { value: { min: 10, max: 40 } },
          move: { enable: true, speed: 2, direction: "top", straight: false, random: true },
        },
      };
    case "confetti":
      return {
        ...baseConfig,
        particles: {
          number: { value: 50 },
          color: { value: ["#26ccff", "#a25afd", "#ff5e7e", "#88ff5a", "#fcff42", "#ffa62d", "#ff36ff"] },
          shape: { type: ["square", "circle"] },
          opacity: { value: 1 },
          size: { value: { min: 5, max: 10 } },
          move: { enable: true, speed: 5, direction: "bottom", straight: false, gravity: { enable: true, acceleration: 2 } },
          rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 30 } },
        },
        emitters: { position: { x: 50, y: -10 }, rate: { quantity: 5, delay: 0.1 } },
      };
    case "balloons":
      return emojiConfig("🎈", 2, 30, 20, "top");
    case "pumpkins":
      return emojiConfig("🎃", 2, 25, 20);
    case "horror_halloween":
      return {
        ...baseConfig,
        particles: {
          number: { value: 40 },
          shape: {
            type: "character",
            options: { character: { value: ["💀", "🦇", "🕷️", "🩸", "👁️"] } },
          },
          opacity: { value: { min: 0.1, max: 0.9 }, animation: { enable: true, speed: 2, sync: false } },
          size: { value: { min: 15, max: 40 } },
          move: {
            enable: true,
            speed: 5,
            direction: "none",
            random: true,
            straight: false,
          },
          wobble: { enable: true, distance: 20, speed: 10 },
          links: {
            enable: true,
            distance: 200,
            color: "#8b0000",
            opacity: 0.5,
            width: 2,
          },
        },
      };
    case "christmas_trees":
      return emojiConfig("🎄", 2, 30, 20);
    case "snowmen":
      return emojiConfig("⛄", 2, 30, 20);
    case "gifts":
      return emojiConfig("🎁", 3, 25, 25);
    case "party_poppers":
      return emojiConfig("🎉", 3, 25, 25);
    case "money":
      return emojiConfig(["💸", "💰", "💵"], 3, 25, 30);
    case "diamonds":
      return emojiConfig("💎", 2, 20, 30);
    case "crowns":
      return emojiConfig("👑", 1, 25, 15, "none");
    case "ghosts":
      return emojiConfig("👻", 1.5, 30, 20, "none");
    case "candy":
      return emojiConfig(["🍬", "🍭", "🍫"], 2, 20, 30);
    case "music":
      return emojiConfig(["🎵", "🎶", "🎼"], 2, 20, 25, "top");

    // ------------------------------------
    // ANIMALS (46-55)
    // ------------------------------------
    case "fireflies":
      return simpleParticle("#bef264", 50, 1.5, 4, "none");
    case "butterflies":
      return emojiConfig("🦋", 2, 20, 15, "none");
    case "birds":
      return emojiConfig(["🐦", "🕊️"], 4, 20, 15, "right");
    case "fish":
      return emojiConfig(["🐟", "🐠", "🐡"], 2, 25, 20, "right");
    case "turtles":
      return emojiConfig("🐢", 1, 25, 10, "right");
    case "cats":
      return emojiConfig(["🐱", "🐈"], 2, 25, 15);
    case "dogs":
      return emojiConfig(["🐶", "🐕"], 2, 25, 15);
    case "rabbits":
      return emojiConfig(["🐰", "🐇"], 3, 25, 15);
    case "frogs":
      return emojiConfig("🐸", 2, 25, 15);
    case "bees":
      return emojiConfig("🐝", 3, 15, 20, "none");

    // ------------------------------------
    // ABSTRACT & MISC (56-70)
    // ------------------------------------
    case "hearts":
      return emojiConfig(["❤️", "💖", "💕", "💘"], 3, 25, 30, "top");
    case "sakura":
      return emojiConfig("🌸", 2, 15, 40, "bottom-left");
    case "embers":
      return simpleParticle(["#f97316", "#ef4444", "#eab308"], 50, 3, 4, "top");
    case "geometry":
      return {
        ...baseConfig,
        particles: {
          number: { value: 20 },
          color: { value: ["#3b82f6", "#10b981", "#8b5cf6"] },
          shape: { type: ["polygon", "triangle", "square"], options: { polygon: { sides: 6 } } },
          opacity: { value: 0.5 },
          size: { value: { min: 15, max: 30 } },
          move: { enable: true, speed: 2, direction: "none", random: true },
          rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 5 } },
        },
      };
    case "spirals":
      return {
        ...baseConfig,
        particles: {
          number: { value: 50 },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: 0.5 },
          size: { value: 3 },
          move: { enable: true, speed: 5, path: { enable: true, options: { spiral: { radius: 5 } } } },
        },
      };
    case "glowing_orbs":
      return {
        ...baseConfig,
        particles: {
          number: { value: 20 },
          color: { value: ["#00ffcc", "#ff00cc", "#cc00ff"] },
          shape: { type: "circle" },
          opacity: { value: 0.8 },
          size: { value: { min: 10, max: 30 } },
          move: { enable: true, speed: 1, direction: "none", random: true },
          filter: { blur: { value: 5 } },
        },
      };
    case "bouncing_balls":
      return {
        ...baseConfig,
        particles: {
          number: { value: 30 },
          color: { value: ["#ff0000", "#00ff00", "#0000ff"] },
          shape: { type: "circle" },
          opacity: { value: 1 },
          size: { value: { min: 10, max: 20 } },
          move: { enable: true, speed: 5, direction: "bottom", outModes: "bounce", gravity: { enable: true, acceleration: 9.8 } },
        },
      };
    case "ascii":
      return emojiConfig(["@", "#", "&", "%", "$", "*"], 2, 15, 50, "bottom");
    case "coffee":
      return emojiConfig("☕", 1.5, 25, 20);
    case "fast_food":
      return emojiConfig(["🍔", "🍟", "🍕", "🌭"], 2, 30, 20);
    case "robots":
      return emojiConfig("🤖", 1, 25, 15, "none");
    case "dice":
      return emojiConfig(["🎲"], 3, 25, 20);
    case "fire":
      return emojiConfig("🔥", 4, 20, 30, "top");
    case "emojis":
      return emojiConfig(["😀", "😂", "😎", "🤩", "🤪"], 2, 25, 25);
    case "footprints":
      return emojiConfig("🐾", 1, 20, 25, "none");

    default:
      return baseConfig;
  }
};

export const effectCategories = [
  {
    title: "🌦️ สภาพอากาศและธรรมชาติ",
    effects: [
      { id: "snow", name: "หิมะตก", icon: "❄️", color: "from-blue-300 to-blue-500" },
      { id: "rain", name: "ฝนตก", icon: "🌧️", color: "from-slate-400 to-slate-600" },
      { id: "sunlight", name: "แสงแดด", icon: "✨", color: "from-amber-300 to-orange-400" },
      { id: "tornado", name: "พายุทอร์นาโด", icon: "🌪️", color: "from-gray-400 to-gray-600" },
      { id: "sandstorm", name: "พายุทราย", icon: "🏜️", color: "from-yellow-600 to-amber-700" },
      { id: "thunderstorm", name: "พายุฟ้าคะนอง", icon: "🌩️", color: "from-slate-700 to-slate-900" },
      { id: "dandelion", name: "แดนดิไลออน", icon: "🌾", color: "from-yellow-100 to-yellow-300" },
      { id: "pine_trees", name: "ต้นสน", icon: "🌲", color: "from-green-600 to-emerald-800" },
      { id: "roses", name: "กุหลาบ", icon: "🌹", color: "from-red-500 to-rose-700" },
      { id: "sunflowers", name: "ทานตะวัน", icon: "🌻", color: "from-yellow-400 to-amber-500" },
      { id: "clover", name: "ใบโคลเวอร์", icon: "🍀", color: "from-green-400 to-green-600" },
      { id: "waterdrops", name: "หยดน้ำ", icon: "💧", color: "from-blue-400 to-cyan-500" },
      { id: "rainbows", name: "รุ้งกินน้ำ", icon: "🌈", color: "from-purple-400 to-red-400" },
      { id: "fog", name: "หมอกเคลื่อนตัว", icon: "🌫️", color: "from-slate-300 to-slate-400" },
      { id: "autumn", name: "ใบไม้ร่วง", icon: "🍂", color: "from-orange-500 to-red-600" },
    ],
  },
  {
    title: "🚀 อวกาศและไซไฟ",
    effects: [
      { id: "stars", name: "ดวงดาว", icon: "🌌", color: "from-indigo-800 to-purple-900" },
      { id: "nebula", name: "กาแล็กซี", icon: "🪐", color: "from-violet-600 to-fuchsia-800" },
      { id: "comets", name: "ดาวหาง", icon: "☄️", color: "from-orange-300 to-red-500" },
      { id: "moons", name: "พระจันทร์", icon: "🌙", color: "from-yellow-200 to-yellow-400" },
      { id: "planets", name: "ดาวเคราะห์", icon: "🌍", color: "from-blue-500 to-green-500" },
      { id: "aliens", name: "เอเลี่ยน", icon: "👽", color: "from-green-400 to-lime-500" },
      { id: "rockets", name: "จรวดพุ่ง", icon: "🚀", color: "from-red-500 to-orange-500" },
      { id: "matrix", name: "ฝนดิจิทัล", icon: "💻", color: "from-emerald-400 to-green-600" },
      { id: "cyberpunk", name: "ไซเบอร์พังก์", icon: "🖲️", color: "from-fuchsia-500 to-cyan-500" },
      { id: "lasers", name: "เลเซอร์", icon: "🔫", color: "from-red-500 to-blue-500" },
      { id: "meteor_shower", name: "ฝนดาวตก", icon: "🌠", color: "from-indigo-400 to-blue-300" },
      { id: "blackhole", name: "หลุมดำ", icon: "🕳️", color: "from-zinc-800 to-black" },
      { id: "magic", name: "เวทมนตร์", icon: "🪄", color: "from-purple-400 to-indigo-500" },
      { id: "speed_lines", name: "เส้นความเร็ว", icon: "💨", color: "from-slate-200 to-slate-400" },
      { id: "yin_yang", name: "หยินหยาง", icon: "☯️", color: "from-black to-white" },
    ],
  },
  {
    title: "🎉 ปาร์ตี้และเทศกาล",
    effects: [
      { id: "fireworks", name: "พลุเฉลิมฉลอง", icon: "🎆", color: "from-rose-500 to-fuchsia-600" },
      { id: "bubbles", name: "ฟองสบู่", icon: "🫧", color: "from-cyan-300 to-blue-400" },
      { id: "confetti", name: "กระดาษสี", icon: "🎊", color: "from-pink-400 to-rose-500" },
      { id: "balloons", name: "ลูกโป่งลอยฟ้า", icon: "🎈", color: "from-sky-400 to-blue-500" },
      { id: "pumpkins", name: "ฟักทองฮาโลวีน", icon: "🎃", color: "from-orange-500 to-orange-700" },
      { id: "horror_halloween", name: "ฮาโลวีนสยองขวัญ", icon: "💀", color: "from-red-900 to-black" },
      { id: "christmas_trees", name: "ต้นคริสต์มาส", icon: "🎄", color: "from-green-500 to-green-700" },
      { id: "snowmen", name: "ตุ๊กตาหิมะ", icon: "⛄", color: "from-blue-100 to-blue-300" },
      { id: "gifts", name: "กล่องของขวัญ", icon: "🎁", color: "from-red-400 to-yellow-400" },
      { id: "party_poppers", name: "พลุกระดาษ", icon: "🎉", color: "from-purple-500 to-pink-500" },
      { id: "money", name: "ธนบัตร", icon: "💸", color: "from-green-400 to-emerald-600" },
      { id: "diamonds", name: "เพชร", icon: "💎", color: "from-cyan-300 to-blue-500" },
      { id: "crowns", name: "มงกุฎ", icon: "👑", color: "from-yellow-400 to-yellow-600" },
      { id: "ghosts", name: "ผีน้อย", icon: "👻", color: "from-slate-200 to-slate-400" },
      { id: "candy", name: "ลูกอม", icon: "🍬", color: "from-pink-300 to-purple-400" },
      { id: "music", name: "ตัวโน้ตดนตรี", icon: "🎵", color: "from-fuchsia-400 to-pink-600" },
    ],
  },
  {
    title: "🐾 สัตว์น่ารัก",
    effects: [
      { id: "fireflies", name: "หิ่งห้อย", icon: "🪲", color: "from-lime-400 to-green-600" },
      { id: "butterflies", name: "ผีเสื้อโบยบิน", icon: "🦋", color: "from-teal-300 to-emerald-500" },
      { id: "birds", name: "นกบิน", icon: "🐦", color: "from-blue-300 to-sky-500" },
      { id: "fish", name: "ปลาว่ายน้ำ", icon: "🐟", color: "from-cyan-400 to-blue-600" },
      { id: "turtles", name: "เต่า", icon: "🐢", color: "from-green-500 to-emerald-700" },
      { id: "cats", name: "แมวเหมียว", icon: "🐱", color: "from-orange-300 to-orange-500" },
      { id: "dogs", name: "น้องหมา", icon: "🐶", color: "from-amber-500 to-amber-700" },
      { id: "rabbits", name: "กระต่าย", icon: "🐰", color: "from-pink-200 to-pink-400" },
      { id: "frogs", name: "กบ", icon: "🐸", color: "from-lime-500 to-green-600" },
      { id: "bees", name: "ผึ้ง", icon: "🐝", color: "from-yellow-300 to-yellow-500" },
    ],
  },
  {
    title: "🎨 นามธรรมและอื่นๆ",
    effects: [
      { id: "hearts", name: "หัวใจพองโต", icon: "❤️", color: "from-red-400 to-red-600" },
      { id: "sakura", name: "ซากุระร่วง", icon: "🌸", color: "from-pink-300 to-pink-500" },
      { id: "embers", name: "สะเก็ดไฟ", icon: "🔥", color: "from-orange-600 to-red-700" },
      { id: "geometry", name: "รูปทรงเรขาคณิต", icon: "🔺", color: "from-indigo-400 to-blue-600" },
      { id: "spirals", name: "เกลียวหมุน", icon: "🌀", color: "from-blue-500 to-indigo-500" },
      { id: "glowing_orbs", name: "ลูกแก้วเรืองแสง", icon: "🔮", color: "from-fuchsia-500 to-purple-700" },
      { id: "bouncing_balls", name: "ลูกบอลเด้ง", icon: "⚽", color: "from-red-400 to-blue-400" },
      { id: "ascii", name: "ตัวอักษร ASCII", icon: "🔣", color: "from-slate-600 to-slate-800" },
      { id: "coffee", name: "กาแฟร้อน", icon: "☕", color: "from-amber-700 to-amber-900" },
      { id: "fast_food", name: "ฟาสต์ฟู้ด", icon: "🍔", color: "from-orange-400 to-red-500" },
      { id: "robots", name: "หุ่นยนต์", icon: "🤖", color: "from-zinc-400 to-zinc-600" },
      { id: "dice", name: "ลูกเต๋า", icon: "🎲", color: "from-slate-100 to-slate-300" },
      { id: "fire", name: "เพลิงไหม้", icon: "🔥", color: "from-red-500 to-yellow-500" },
      { id: "emojis", name: "หน้าอิโมจิ", icon: "😀", color: "from-yellow-300 to-yellow-500" },
      { id: "footprints", name: "รอยเท้า", icon: "🐾", color: "from-stone-500 to-stone-700" },
    ],
  },
];
