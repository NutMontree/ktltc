"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var image_1 = require("next/image");
var _3d_card_1 = require("@/components/ui/3d-card");
var framer_motion_1 = require("framer-motion");
var icons_react_1 = require("@tabler/icons-react");
// --- ข้อมูลองค์กร ---
var ORG_INFO = [
  {
    id: "vision",
    label: "วิสัยทัศน์",
    icon: React.createElement(icons_react_1.IconEye, { className: "h-4 w-4" }),
    title: "วิสัยทัศน์ (Vision)",
    content:
      "มุ่งมั่นจัดการอาชีวศึกษา ให้ผู้เรียนมีสมรรถนะวิชาชีพ คุณธรรม จริยธรรม และคุณภาพชีวิตที่ดี สอดคล้องกับความต้องการของตลาดแรงงานและสังคม",
    color: "bg-blue-500",
  },
  {
    id: "uniqueness",
    label: "เอกลักษณ์",
    icon: React.createElement(icons_react_1.IconFingerprint, { className: "h-4 w-4" }),
    title: "เอกลักษณ์ (Uniqueness)",
    content: "บริการวิชาชีพสู่ชุมชน และสังคม (Professional Service to Community and Society)",
    color: "bg-indigo-500",
  },
  {
    id: "identity",
    label: "อัตลักษณ์",
    icon: React.createElement(icons_react_1.IconDiamond, { className: "h-4 w-4" }),
    title: "อัตลักษณ์ (Identity)",
    content:
      "ทักษะเยี่ยม เปี่ยมคุณธรรม ล้ำเลิศจิตอาสา (Excellent Skills, Full of Virtue, Outstanding Volunteer Spirit)",
    color: "bg-violet-500",
  },
  {
    id: "philosophy",
    label: "ปรัชญา",
    icon: React.createElement(icons_react_1.IconBulb, { className: "h-4 w-4" }),
    title: "ปรัชญา (Philosophy)",
    content:
      "ทักษะเยี่ยม เปี่ยมคุณธรรม นำวิชาการ (Excellent Skills, Full of Virtue, Leading Academically)",
    color: "bg-amber-500",
  },
  {
    id: "values",
    label: "ค่านิยม",
    icon: React.createElement(icons_react_1.IconHeart, { className: "h-4 w-4" }),
    title: "ค่านิยม (Core Values)",
    content:
      "สร้างคนดี มีฝีมือ ยึดถือจรรยาบรรณ (Creating Good People, Skilled, Adhering to Ethics)",
    color: "bg-rose-500",
  },
  {
    id: "motto",
    label: "คำขวัญ",
    icon: React.createElement(icons_react_1.IconQuote, { className: "h-4 w-4" }),
    title: "คำขวัญ (Motto)",
    content: "วินัยดี มีวิชา กีฬาเด่น (Good Discipline, Knowledgeable, Outstanding Sports)",
    color: "bg-emerald-500",
  },
];
function WelcomePage() {
  var _a = react_1.useState(ORG_INFO[0]),
    activeTab = _a[0],
    setActiveTab = _a[1];
  return React.createElement(
    "section",
    {
      className: "relative w-full overflow-hidden bg-slate-50 py-20 font-sans dark:bg-transparent",
    },
    React.createElement(
      "div",
      { className: "pointer-events-none absolute inset-0 z-0" },
      React.createElement("div", {
        className:
          "absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[24px_24px] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]",
      }),
      React.createElement("div", {
        className:
          "absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-[100px] filter dark:bg-blue-500/10",
      }),
      React.createElement("div", {
        className:
          "absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px] filter dark:bg-indigo-500/10",
      }),
    ),
    React.createElement(
      framer_motion_1.motion.div,
      {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: "easeOut" },
        viewport: { once: true },
        className: "relative z-10 container  px-4 lg:px-8",
      },
      React.createElement(
        "div",
        { className: "grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-8" },
        React.createElement(
          "div",
          { className: "flex flex-col items-center justify-center lg:col-span-5 lg:justify-start" },
          React.createElement(
            _3d_card_1.CardContainer,
            { className: "inter-var w-full max-w-sm lg:max-w-md" },
            React.createElement(
              _3d_card_1.CardBody,
              {
                className:
                  "group/card relative h-auto w-auto rounded-3xl border border-white/40 bg-white/60 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-blue-500/20 dark:border-white/10 dark:bg-slate-900/60 dark:hover:shadow-blue-900/40",
              },
              React.createElement(
                _3d_card_1.CardItem,
                { translateZ: "30", className: "mb-4" },
                React.createElement(
                  "span",
                  {
                    className:
                      "inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300",
                  },
                  "KTLTC Director",
                ),
              ),
              React.createElement(
                _3d_card_1.CardItem,
                {
                  translateZ: "50",
                  className: "text-3xl font-extrabold text-slate-800 dark:text-slate-100",
                },
                React.createElement(
                  "span",
                  {
                    className:
                      "bg-linear-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent dark:from-white dark:to-slate-400",
                  },
                  "\u0E19\u0E32\u0E07\u0E2A\u0E32\u0E27\u0E17\u0E31\u0E01\u0E29\u0E34\u0E13\u0E32 \u0E0A\u0E21\u0E08\u0E31\u0E19\u0E17\u0E23\u0E4C",
                ),
              ),
              React.createElement(
                _3d_card_1.CardItem,
                {
                  as: "p",
                  translateZ: "60",
                  className: "mt-2 text-sm font-medium text-slate-500 dark:text-slate-400",
                },
                "\u0E1C\u0E39\u0E49\u0E2D\u0E33\u0E19\u0E27\u0E22\u0E01\u0E32\u0E23\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E01\u0E31\u0E19\u0E17\u0E23\u0E25\u0E31\u0E01\u0E29\u0E4C",
              ),
              React.createElement(
                _3d_card_1.CardItem,
                { translateZ: "80", className: "mt-8 w-full" },
                React.createElement(
                  "div",
                  {
                    className:
                      "relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10",
                  },
                  React.createElement(image_1["default"], {
                    src: "/images/banners/3.webp",
                    alt: "Director Image",
                    width: 500,
                    height: 625,
                    priority: true,
                    className:
                      "h-full w-full object-cover object-top transition-transform duration-700 group-hover/card:scale-110",
                  }),
                ),
              ),
            ),
          ),
        ),
        React.createElement(
          "div",
          { className: "flex h-full flex-col lg:col-span-7" },
          React.createElement(
            "div",
            {
              className:
                "relative h-full overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/40",
            },
            React.createElement(
              "div",
              {
                className:
                  "border-b border-slate-200/60 bg-white/50 px-8 py-6 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/50",
              },
              React.createElement(
                "div",
                { className: "flex items-center gap-4" },
                React.createElement(
                  "div",
                  {
                    className:
                      "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-colors duration-300 " +
                      activeTab.color +
                      " text-white",
                  },
                  activeTab.icon,
                ),
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "h3",
                    { className: "text-xl font-bold text-slate-800 dark:text-slate-100" },
                    "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23",
                  ),
                  React.createElement(
                    framer_motion_1.AnimatePresence,
                    { mode: "wait" },
                    React.createElement(
                      framer_motion_1.motion.p,
                      {
                        key: activeTab.id,
                        initial: { opacity: 0, y: 5 },
                        animate: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: -5 },
                        className: "text-sm font-medium text-slate-500 dark:text-slate-400",
                      },
                      "\u0E41\u0E2A\u0E14\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25: ",
                      activeTab.label,
                    ),
                  ),
                ),
              ),
            ),
            React.createElement(
              "div",
              { className: "px-6 pt-6" },
              React.createElement(
                "div",
                { className: "flex flex-wrap gap-2 pb-2" },
                ORG_INFO.map(function (tab) {
                  return React.createElement(
                    "button",
                    {
                      key: tab.id,
                      onClick: function () {
                        return setActiveTab(tab);
                      },
                      className:
                        "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none " +
                        (activeTab.id === tab.id
                          ? "text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"),
                    },
                    activeTab.id === tab.id &&
                      React.createElement(framer_motion_1.motion.span, {
                        layoutId: "active-pill",
                        className: "absolute inset-0 z-0 rounded-full bg-blue-600 shadow-md",
                        transition: {
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        },
                      }),
                    React.createElement(
                      "span",
                      { className: "relative z-10 flex items-center gap-2" },
                      tab.icon,
                      " ",
                      tab.label,
                    ),
                  );
                }),
              ),
            ),
            React.createElement(
              "div",
              { className: "min-h-[300px] p-6 md:p-8" },
              React.createElement(
                framer_motion_1.AnimatePresence,
                { mode: "wait" },
                React.createElement(
                  framer_motion_1.motion.div,
                  {
                    key: activeTab.id,
                    initial: { opacity: 0, x: 20 },
                    animate: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: -20 },
                    transition: { duration: 0.3 },
                    className: "flex flex-col gap-4",
                  },
                  React.createElement(
                    "div",
                    {
                      className:
                        "inline-block w-fit rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                    },
                    activeTab.label,
                  ),
                  React.createElement(
                    "h2",
                    {
                      className: "text-2xl leading-tight font-bold text-slate-900 dark:text-white",
                    },
                    activeTab.title,
                  ),
                  React.createElement(
                    "div",
                    { className: "h-1 w-20 rounded-full bg-slate-200 dark:bg-slate-700" },
                    React.createElement(framer_motion_1.motion.div, {
                      className: "h-full rounded-full " + activeTab.color,
                      initial: { width: 0 },
                      animate: { width: "100%" },
                      transition: { delay: 0.2, duration: 0.5 },
                    }),
                  ),
                  React.createElement(
                    "p",
                    { className: "text-lg leading-relaxed text-slate-600 dark:text-slate-300" },
                    activeTab.content,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
exports["default"] = WelcomePage;
