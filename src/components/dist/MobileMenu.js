"use client";
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
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
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
var react_1 = require("react");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var ThemeToggle_1 = require("./ThemeToggle"); // ✅ Import ปุ่มสลับธีม
function MobileMenu(_a) {
  var _this = this;
  var _b;
  var _c = _a.menuTree,
    menuTree = _c === void 0 ? [] : _c;
  var _d = react_1.useState(false),
    isOpen = _d[0],
    setIsOpen = _d[1];
  var _e = react_1.useState(null),
    openSubMenuId = _e[0],
    setOpenSubMenuId = _e[1];
  var _f = react_1.useState(null),
    user = _f[0],
    setUser = _f[1]; // ✅ State เก็บข้อมูลผู้ใช้
  var pathname = navigation_1.usePathname();
  var router = navigation_1.useRouter();
  // 1. ตรวจสอบสถานะล็อกอินเมื่อโหลดหน้าเว็บ
  react_1.useEffect(
    function () {
      var fetchUser = function () {
        return __awaiter(_this, void 0, void 0, function () {
          var res, data, error_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, fetch("/api/profile")];
              case 1:
                res = _a.sent();
                if (!res.ok) return [3 /*break*/, 3];
                return [4 /*yield*/, res.json()];
              case 2:
                data = _a.sent();
                setUser(data);
                return [3 /*break*/, 4];
              case 3:
                setUser(null);
                _a.label = 4;
              case 4:
                return [3 /*break*/, 6];
              case 5:
                error_1 = _a.sent();
                console.error("Failed to fetch user", error_1);
                setUser(null);
                return [3 /*break*/, 6];
              case 6:
                return [2 /*return*/];
            }
          });
        });
      };
      fetchUser();
    },
    [pathname],
  ); // เช็คใหม่ทุกครั้งที่เปลี่ยนหน้า (เผื่อ login/logout)
  // 2. ฟังก์ชันออกจากระบบ
  var handleLogout = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var res, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, fetch("/api/auth/logout", { method: "POST" })];
          case 1:
            res = _a.sent();
            if (res.ok) {
              setUser(null);
              router.push("/login");
              router.refresh();
            } else {
              // Fallback: ถ้าไม่มี API Logout ให้เคลียร์ cookie ฝั่ง client หรือ redirect
              // document.cookie = "token=; Max-Age=0; path=/;";
              window.location.href = "/login";
            }
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            window.location.href = "/login";
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var closeMenu = function () {
    setIsOpen(false);
    setOpenSubMenuId(null);
  };
  var toggleSubMenu = function (id) {
    setOpenSubMenuId(openSubMenuId === id ? null : id);
  };
  // ล็อกการเลื่อนหน้าจอหลักเมื่อเปิดเมนู
  react_1.useEffect(
    function () {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
      return function () {
        document.body.style.overflow = "unset";
      };
    },
    [isOpen],
  );
  var safeMenuTree = menuTree || [];
  return React.createElement(
    "div",
    { className: "xl:hidden" },
    React.createElement(
      "button",
      {
        onClick: function () {
          return setIsOpen(!isOpen);
        },
        className:
          "p-2 rounded-lg transition-colors focus:outline-none " +
          (isOpen
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"),
        "aria-label": "Toggle Menu",
      },
      isOpen
        ? React.createElement(
            "svg",
            {
              className: "w-6 h-6",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
            },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M6 18L18 6M6 6l12 12",
            }),
          )
        : React.createElement(
            "svg",
            {
              className: "w-6 h-6",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
            },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M4 6h16M4 12h16M4 18h16",
            }),
          ),
    ),
    isOpen &&
      React.createElement(
        "div",
        {
          className: "fixed top-16 left-0 w-full h-[calc(100vh-4rem)] z-[9999]",
        },
        React.createElement(
          "div",
          {
            className:
              "w-full h-full bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 overflow-y-auto pb-24 animate-in slide-in-from-top-2 duration-200",
          },
          React.createElement(
            "div",
            { className: "flex flex-col p-2 space-y-3" },
            React.createElement(
              link_1["default"],
              {
                href: "/",
                onClick: closeMenu,
                className:
                  "block w-full p-4 rounded-xl font-bold text-lg transition-all shadow-sm " +
                  (pathname === "/"
                    ? "bg-blue-600 text-white shadow-blue-500/30"
                    : "bg-zinc-50 text-zinc-800 border border-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800"),
              },
              "\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E23\u0E01",
            ),
            React.createElement(
              link_1["default"],
              {
                href: "/about",
                onClick: closeMenu,
                className:
                  "block w-full p-4 rounded-xl font-bold text-lg transition-all shadow-sm " +
                  (pathname === "/about"
                    ? "bg-blue-600 text-white shadow-blue-500/30"
                    : "bg-zinc-50 text-zinc-800 border border-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800"),
              },
              "เกี่ยวกับเรา / ติดต่อเรา",
            ),
            safeMenuTree.map(function (item) {
              var hasChildren = item.children && item.children.length > 0;
              var isActive = openSubMenuId === item._id;
              return React.createElement(
                "div",
                {
                  key: item._id,
                  className:
                    "flex flex-col rounded-xl border overflow-hidden transition-colors " +
                    (isActive
                      ? "bg-blue-50/30 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30"
                      : "bg-zinc-50 border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"),
                },
                hasChildren
                  ? React.createElement(
                      "button",
                      {
                        onClick: function () {
                          return toggleSubMenu(item._id || "");
                        },
                        className:
                          "flex justify-between items-center w-full p-4 text-left font-bold text-base text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                      },
                      React.createElement("span", null, item.label),
                      React.createElement(
                        "svg",
                        {
                          className:
                            "w-5 h-5 text-zinc-400 transition-transform duration-300 " +
                            (isActive ? "rotate-180 text-blue-500" : ""),
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor",
                        },
                        React.createElement("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M19 9l-7 7-7-7",
                        }),
                      ),
                    )
                  : React.createElement(
                      link_1["default"],
                      {
                        href: item.path,
                        onClick: closeMenu,
                        className:
                          "block w-full p-4 font-bold text-base transition-colors " +
                          (pathname === item.path
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-zinc-700 dark:text-zinc-200"),
                      },
                      item.label,
                    ),
                hasChildren &&
                  isActive &&
                  React.createElement(
                    "div",
                    {
                      className:
                        "bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-top-1 duration-200",
                    },
                    item.children.map(function (child) {
                      return React.createElement(
                        link_1["default"],
                        {
                          key: child._id,
                          href: child.path,
                          onClick: closeMenu,
                          className:
                            "flex items-center py-3.5 pl-8 pr-4 text-sm font-medium border-b last:border-0 border-zinc-50 dark:border-zinc-900 transition-colors " +
                            (pathname === child.path
                              ? "text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-900/10"
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"),
                        },
                        React.createElement("span", {
                          className:
                            "w-1.5 h-1.5 rounded-full mr-3 " +
                            (pathname === child.path
                              ? "bg-blue-500"
                              : "bg-zinc-300 dark:bg-zinc-600"),
                        }),
                        child.label,
                      );
                    }),
                  ),
              );
            }),
            React.createElement(
              "div",
              {
                className:
                  "flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 mt-2",
              },
              React.createElement(
                "span",
                { className: "font-bold text-zinc-700 dark:text-zinc-200" },
                "\u0E42\u0E2B\u0E21\u0E14\u0E41\u0E2A\u0E14\u0E07\u0E1C\u0E25",
              ),
              React.createElement(ThemeToggle_1["default"], null),
            ),
            React.createElement(
              "div",
              {
                className: "pt-4 pb-8 space-y-3 border-t border-zinc-100 dark:border-zinc-800 mt-4",
              },
              user
                ? // --- กรณีล็อกอินแล้ว ---
                  React.createElement(
                    "div",
                    { className: "flex flex-col space-y-3" },
                    React.createElement(
                      "div",
                      { className: "flex items-center gap-3 px-4 mb-2" },
                      React.createElement(
                        "div",
                        {
                          className:
                            "w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md",
                        },
                        ((_b = user.name) === null || _b === void 0
                          ? void 0
                          : _b.charAt(0).toUpperCase()) || "U",
                      ),
                      React.createElement(
                        "div",
                        { className: "flex flex-col" },
                        React.createElement(
                          "span",
                          {
                            className: "font-bold text-zinc-800 dark:text-white text-lg",
                          },
                          user.name,
                        ),
                        React.createElement(
                          "span",
                          {
                            className:
                              "text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide",
                          },
                          user.role,
                        ),
                      ),
                    ),
                    React.createElement(
                      link_1["default"],
                      {
                        href: "/dashboard",
                        onClick: closeMenu,
                        className:
                          "mx-1 block text-center py-3.5 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50 transition-colors",
                      },
                      "\uD83D\uDE80 \u0E44\u0E1B\u0E17\u0E35\u0E48 Dashboard",
                    ),
                    React.createElement(
                      link_1["default"],
                      {
                        href: "/dashboard/profile",
                        onClick: closeMenu,
                        className:
                          "mx-1 block text-center py-3.5 rounded-xl border border-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors",
                      },
                      "\uD83D\uDC64 \u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C",
                    ),
                    React.createElement(
                      "button",
                      {
                        onClick: handleLogout,
                        className:
                          "mx-1 mt-2 block w-full text-center py-3.5 rounded-xl text-red-600 font-semibold hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 transition-colors",
                      },
                      "\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A",
                    ),
                  )
                : // --- กรณีไม่ได้ล็อกอิน ---
                  React.createElement(
                    link_1["default"],
                    {
                      href: "/login",
                      onClick: closeMenu,
                      className:
                        "block w-full text-center py-4 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-transform hover:shadow-blue-500/40",
                    },
                    "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A / Admin",
                  ),
            ),
          ),
        ),
      ),
  );
}
exports["default"] = MobileMenu;
