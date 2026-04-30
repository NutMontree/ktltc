"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var glowing_effect_1 = require("@/components/ui/glowing-effect");
var image_1 = require("next/image");
var framer_motion_1 = require("framer-motion");
var link_preview_1 = require("./ui/link-preview");
function BackgroundBeamsWithCollisionDemo() {
  return react_1["default"].createElement(
    framer_motion_1.motion.div,
    {
      initial: { opacity: 0, y: 50 },
      whileInView: { opacity: 1, y: 0 },
      transition: { delay: 0.2, duration: 0.8, ease: "easeOut" },
      className: "py-24",
    },
    react_1["default"].createElement(
      "ul",
      {
        className:
          "grid grid-cols-1 gap-6 md:grid-cols-12 max-w-[1600px] mx-auto px-4",
      },
      react_1["default"].createElement(GridItem, {
        area: "md:col-span-12",
        // ✅ นำข้อความกลับมาใส่ตรงนี้ครับ
        title: react_1["default"].createElement(
          "div",
          { className: "pt-6 text-xl md:text-2xl font-bold" },
          "\u0E52\u0E54 \u0E15\u0E38\u0E25\u0E32\u0E04\u0E21 \u0E52\u0E55\u0E56\u0E58",
        ),
        description: react_1["default"].createElement(
          "div",
          { className: "pt-2 pb-6 leading-relaxed" },
          "\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E19\u0E32\u0E07\u0E40\u0E08\u0E49\u0E32\u0E2A\u0E34\u0E23\u0E34\u0E01\u0E34\u0E15\u0E34\u0E4C \u0E1E\u0E23\u0E30\u0E1A\u0E23\u0E21\u0E23\u0E32\u0E0A\u0E34\u0E19\u0E35\u0E19\u0E32\u0E16",
          react_1["default"].createElement("br", null),
          "\u0E1E\u0E23\u0E30\u0E1A\u0E23\u0E21\u0E23\u0E32\u0E0A\u0E0A\u0E19\u0E19\u0E35\u0E1E\u0E31\u0E19\u0E1B\u0E35\u0E2B\u0E25\u0E27\u0E07 \u0E40\u0E2A\u0E14\u0E47\u0E08\u0E2A\u0E27\u0E23\u0E23\u0E04\u0E15",
          react_1["default"].createElement("br", null),
          "\u0E18 \u0E2A\u0E16\u0E34\u0E15\u0E43\u0E19\u0E14\u0E27\u0E07\u0E43\u0E08\u0E44\u0E17\u0E22\u0E19\u0E34\u0E23\u0E31\u0E19\u0E14\u0E23\u0E4C",
          react_1["default"].createElement("br", null),
          "\u0E14\u0E49\u0E27\u0E22\u0E40\u0E01\u0E25\u0E49\u0E32\u0E14\u0E49\u0E27\u0E22\u0E01\u0E23\u0E30\u0E2B\u0E21\u0E48\u0E2D\u0E21\u0E02\u0E2D\u0E40\u0E14\u0E0A\u0E30 \u0E02\u0E49\u0E32\u0E1E\u0E23\u0E30\u0E1E\u0E38\u0E17\u0E18\u0E40\u0E08\u0E49\u0E32",
          react_1["default"].createElement("br", null),
          "\u0E04\u0E13\u0E30\u0E1C\u0E39\u0E49\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23 \u0E04\u0E23\u0E39 \u0E1A\u0E38\u0E04\u0E25\u0E32\u0E01\u0E23\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32 \u0E40\u0E40\u0E25\u0E30\u0E19\u0E31\u0E01\u0E40\u0E23\u0E35\u0E22\u0E19 \u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32 ",
          react_1["default"].createElement("br", null),
          "\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E01\u0E31\u0E19\u0E17\u0E23\u0E25\u0E31\u0E01\u0E29\u0E4C",
        ),
        image: react_1["default"].createElement(
          "div",
          { className: "relative w-full rounded-xl overflow-hidden shadow-lg" },
          react_1["default"].createElement(image_1["default"], {
            src: "/wallpaper/1.webp",
            alt: "\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E19\u0E32\u0E07\u0E40\u0E08\u0E49\u0E32\u0E2A\u0E34\u0E23\u0E34\u0E01\u0E34\u0E15\u0E34\u0E4C",
            width: 1200,
            height: 800,
            className: "w-full h-auto object-cover",
            priority: true,
            // ไม้ตาย: แก้ภาพจาง/ภาพหาย
            unoptimized: true,
          }),
        ),
      }),
      react_1["default"].createElement(GridItem, {
        area: "md:col-span-12",
        title: null,
        description: null,
        image: react_1["default"].createElement(
          "div",
          { className: "relative w-full rounded-xl overflow-hidden shadow-lg" },
          react_1["default"].createElement(
            link_preview_1.LinkPreview,
            { url: "https://ktltc.site/news/69892ed2e016a8b49ffc9974" },
            react_1["default"].createElement(image_1["default"], {
              src: "/wallpaper/2.webp",
              alt: "\u0E02\u0E48\u0E32\u0E27\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E2A\u0E31\u0E21\u0E1E\u0E31\u0E19\u0E18\u0E4C",
              width: 1200,
              height: 800,
              className: "w-full h-auto object-cover",
              unoptimized: true,
            }),
          ),
        ),
      }),
    ),
  );
}
exports["default"] = BackgroundBeamsWithCollisionDemo;
var GridItem = function (_a) {
  var area = _a.area,
    image = _a.image,
    title = _a.title,
    description = _a.description;
  return react_1["default"].createElement(
    "li",
    { className: "list-none min-h-[10rem] " + area },
    react_1["default"].createElement(
      "div",
      { className: "relative h-full rounded-3xl  " },
      react_1["default"].createElement(glowing_effect_1.GlowingEffect, {
        spread: 40,
        glow: true,
        disabled: false,
        proximity: 64,
        inactiveZone: 0.01,
      }),
      react_1["default"].createElement(
        "div",
        {
          className:
            "relative flex flex-col justify-center items-center h-full m-4",
        },
        react_1["default"].createElement("div", { className: "w-full" }, image),
        (title || description) &&
          react_1["default"].createElement(
            "div",
            { className: "space-y-3 text-center mt-4" },
            title &&
              react_1["default"].createElement(
                "h3",
                { className: "font-sans text-xl font-semibold md:text-2xl" },
                title,
              ),
            description &&
              react_1["default"].createElement(
                "div",
                { className: "font-sans text-sm md:text-base" },
                description,
              ),
          ),
      ),
    ),
  );
};
