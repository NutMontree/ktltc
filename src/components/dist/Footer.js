"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
exports.__esModule = true;
var link_1 = require("next/link");
var fa_1 = require("react-icons/fa");
var db_1 = require("@/lib/db");
var VisitorTracker_1 = require("./VisitorTracker");
var image_1 = require("next/image");
// 1. ฟังก์ชันดึงเมนู Footer จากฐานข้อมูล (Server-side)
function getFooterNavItems() {
  return __awaiter(this, void 0, void 0, function () {
    var client, db, items, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, db_1["default"]];
        case 1:
          client = _a.sent();
          db = client.db("ktltc_db");
          return [
            4 /*yield*/,
            db.collection("navbar").find({}).sort({ order: 1 }).toArray(),
          ];
        case 2:
          items = _a.sent();
          return [2 /*return*/, JSON.parse(JSON.stringify(items))];
        case 3:
          error_1 = _a.sent();
          console.error("Error fetching footer nav:", error_1);
          return [2 /*return*/, []];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
// 2. ฟังก์ชันดึงยอดผู้เข้าชมล่าสุดมาแสดง (Read-only)
function getVisitorCount() {
  return __awaiter(this, void 0, void 0, function () {
    var client, db, result, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, db_1["default"]];
        case 1:
          client = _a.sent();
          db = client.db("ktltc_db");
          return [
            4 /*yield*/,
            db.collection("site_stats").findOne({ _id: "visitor_count" }),
          ];
        case 2:
          result = _a.sent();
          return [
            2 /*return*/,
            (result === null || result === void 0 ? void 0 : result.count) || 1,
          ];
        case 3:
          error_2 = _a.sent();
          console.error("Error fetching visitor count:", error_2);
          return [2 /*return*/, 134001];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
// --- Main Footer Component ---
function Footer() {
  return __awaiter(this, void 0, void 0, function () {
    var navItems, visitorCount, countDigits, parents, getChildren;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, getFooterNavItems()];
        case 1:
          navItems = _a.sent();
          return [4 /*yield*/, getVisitorCount()];
        case 2:
          visitorCount = _a.sent();
          var countStr = String(visitorCount);
          countDigits = (countStr.length < 6 ? countStr.padStart(6, "0") : countStr).split("");
          parents = navItems.filter(function (item) {
            return !item.parentId;
          });
          getChildren = function (parentId) {
            return navItems.filter(function (item) {
              return item.parentId === parentId;
            });
          };
          return [
            2 /*return*/,
            React.createElement(
              "footer",
              {
                className:
                  "bg-linear-to-b from-[#0f172a] to-[#020617] text-slate-300 pt-16 pb-8 border-t border-slate-800",
              },
              React.createElement(VisitorTracker_1["default"], null),
              React.createElement(
                "div",
                { className: "max-w-[1600px] mx-auto px-4 md:px-8" },
                React.createElement(
                  "div",
                  {
                    className:
                      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12",
                  },
                  React.createElement(
                    "div",
                    { className: "lg:col-span-1 space-y-6" },
                    React.createElement(
                      "div",
                      { className: "flex items-center gap-3" },
                      React.createElement(
                        "div",
                        {
                          className:
                            "w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-sm",
                        },
                        React.createElement(image_1["default"], {
                          src: "/images/favicon.ico",
                          alt: "KTL Logo",
                          width: 48,
                          height: 48,
                        }),
                      ),
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "h2",
                          {
                            className:
                              "font-bold text-lg leading-tight text-white",
                          },
                          "KTL-TC",
                        ),
                        React.createElement(
                          "p",
                          { className: "text-[10px] text-slate-400" },
                          "KANTHARALAK TECHNICAL COLLEGE",
                        ),
                      ),
                    ),
                    React.createElement(
                      "div",
                      { className: "text-slate-400 text-sm leading-relaxed" },
                      "82 \u0E2B\u0E21\u0E39\u0E48 1 \u0E15\u0E33\u0E1A\u0E25 \u0E08\u0E32\u0E19\u0E43\u0E2B\u0E0D\u0E48 \u0E2D\u0E33\u0E40\u0E20\u0E2D\u0E01\u0E31\u0E19\u0E17\u0E23\u0E25\u0E31\u0E01\u0E29\u0E4C \u0E28\u0E23\u0E35\u0E2A\u0E30\u0E40\u0E01\u0E29 33110",
                    ),
                    React.createElement(
                      "div",
                      { className: "flex gap-4" },
                      React.createElement(SocialIcon, {
                        icon: React.createElement(fa_1.FaFacebookF, null),
                        href: "https://www.facebook.com/ngan.prachasamphanth.withyalay.thekhnikh",
                      }),
                      React.createElement(SocialIcon, {
                        icon: React.createElement(fa_1.FaTwitter, null),
                      }),
                      React.createElement(SocialIcon, {
                        icon: React.createElement(fa_1.FaInstagram, null),
                      }),
                      React.createElement(SocialIcon, {
                        icon: React.createElement(fa_1.FaLinkedinIn, null),
                      }),
                    ),
                  ),
                  parents.length > 0
                    ? parents.map(function (parent) {
                        return React.createElement(
                          "div",
                          { key: parent._id },
                          React.createElement(
                            "h3",
                            {
                              className:
                                "font-bold text-base mb-6 border-l-2 border-blue-700 pl-3 text-white",
                            },
                            parent.path && parent.path !== "#"
                              ? React.createElement(
                                  link_1["default"],
                                  {
                                    href: parent.path,
                                    className:
                                      "hover:text-blue-400 transition-colors",
                                  },
                                  parent.label,
                                )
                              : parent.label,
                          ),
                          React.createElement(
                            "ul",
                            { className: "space-y-3 text-sm text-slate-400" },
                            getChildren(parent._id).map(function (child) {
                              return React.createElement(
                                FooterLink,
                                { key: child._id, href: child.path },
                                child.label,
                              );
                            }),
                          ),
                        );
                      })
                    : React.createElement(
                        "div",
                        {
                          className:
                            "col-span-4 flex items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl p-8",
                        },
                        "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E21\u0E19\u0E39\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A",
                      ),
                ),
                React.createElement(
                  "div",
                  {
                    className:
                      "flex flex-col items-center justify-center mb-8 gap-3",
                  },
                  React.createElement(
                    "span",
                    {
                      className:
                        "text-xs font-bold text-slate-500 uppercase tracking-widest",
                    },
                    "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E1C\u0E39\u0E49\u0E40\u0E02\u0E49\u0E32\u0E0A\u0E21\u0E40\u0E27\u0E47\u0E1A\u0E44\u0E0B\u0E15\u0E4C (Visitors)",
                  ),
                  React.createElement(
                    "div",
                    {
                      className:
                        "flex gap-1 p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-inner",
                    },
                    countDigits.map(function (digit, index) {
                      return React.createElement(
                        "div",
                        {
                          key: index,
                          className:
                            "relative w-8 h-12 md:w-10 md:h-14 bg-gradient-to-b from-[#222] to-[#111] rounded border border-slate-700 flex items-center justify-center overflow-hidden shadow-lg",
                        },
                        React.createElement("div", {
                          className:
                            "absolute top-1/2 w-full h-px bg-black/50 z-10 shadow-[0_1px_0_rgba(255,255,255,0.1)]",
                        }),
                        React.createElement(
                          "span",
                          {
                            className:
                              "text-2xl md:text-3xl font-mono font-bold text-slate-200 z-0",
                          },
                          digit,
                        ),
                        React.createElement("div", {
                          className:
                            "absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none",
                        }),
                      );
                    }),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    className:
                      "pt-8 border-t border-slate-800 flex flex-col items-center justify-center text-center text-xs text-slate-500 space-y-2",
                  },
                  React.createElement(
                    "div",
                    { className: "flex items-center gap-1" },
                    "Copyright \u00A9 ",
                    new Date().getFullYear(),
                    ".",
                    React.createElement(
                      "p",
                      { className: "text-blue-500" },
                      React.createElement("span", null, "KTLTC"),
                      " /\u0E07\u0E32\u0E19\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E25\u0E30\u0E2A\u0E32\u0E23\u0E2A\u0E19\u0E40\u0E17\u0E28",
                    ),
                  ),
                  React.createElement(
                    "p",
                    { className: "flex items-center gap-1" },
                    "Designed By",
                    React.createElement(
                      "a",
                      {
                        href: "https://www.allmaster.store/",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className:
                          "font-bold text-white hover:text-blue-400 transition-colors ml-1",
                      },
                      "All M Min",
                    ),
                  ),
                ),
              ),
            ),
          ];
      }
    });
  });
}
exports["default"] = Footer;
function FooterLink(_a) {
  var href = _a.href,
    children = _a.children;
  return React.createElement(
    "li",
    null,
    React.createElement(
      link_1["default"],
      {
        href: href,
        className:
          "hover:text-white hover:translate-x-1 transition-all duration-300 inline-block",
      },
      children,
    ),
  );
}
// ✅ แก้ไข: เพิ่ม Props 'href' ให้รับลิงก์ได้ และเปิดแท็บใหม่เมื่อคลิก
function SocialIcon(_a) {
  var icon = _a.icon,
    _b = _a.href,
    href = _b === void 0 ? "#" : _b;
  return React.createElement(
    "a",
    {
      href: href,
      target: href !== "#" ? "_blank" : "_self",
      rel: href !== "#" ? "noopener noreferrer" : undefined,
      className:
        "w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-blue-700 hover:text-white hover:scale-110 transition-all duration-300 border border-slate-700",
    },
    icon,
  );
}
