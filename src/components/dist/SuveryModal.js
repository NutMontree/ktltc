// src/components/SuveryDetailModal.tsx
"use client";
"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react"); // ใช้ lucide-react สำหรับไอคอนที่สวยงาม
var SuveryDetailModal = function (_a) {
  var isOpen = _a.isOpen,
    onClose = _a.onClose,
    suvery = _a.suvery;
  if (!isOpen || !suvery) return null;
  // ฟอร์แมตวันที่
  var formatDate = function (dateString) {
    try {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_a) {
      return String(dateString);
    }
  };
  // Helper function to check valid value
  var hasValue = function (val) {
    if (val === null || val === undefined) return false;
    if (typeof val === "string" && val.trim() === "") return false;
    return true;
  };
  // Component ย่อยสำหรับแสดงข้อมูล 1 บรรทัด
  var DataRow = function (_a) {
    var label = _a.label,
      value = _a.value,
      _b = _a.fullWidth,
      fullWidth = _b === void 0 ? false : _b;
    if (!hasValue(value)) return null;
    return React.createElement(
      "div",
      {
        className: "flex flex-col " + (fullWidth ? "col-span-full" : "col-span-1"),
      },
      React.createElement(
        "span",
        {
          className: "text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1",
        },
        label,
      ),
      React.createElement(
        "span",
        {
          className:
            "text-base font-medium text-gray-800 dark:text-gray-200 break-words leading-relaxed",
        },
        value,
      ),
    );
  };
  // Component ย่อยสำหรับ Group Header
  var SectionHeader = function (_a) {
    var title = _a.title,
      Icon = _a.icon;
    return React.createElement(
      "div",
      {
        className:
          "flex items-center gap-2 mb-4 mt-6 pb-2 border-b border-gray-100 dark:border-gray-700",
      },
      React.createElement(
        "div",
        {
          className:
            "p-1.5 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        },
        React.createElement(Icon, { size: 18 }),
      ),
      React.createElement(
        "h4",
        { className: "text-lg font-bold text-gray-800 dark:text-gray-100" },
        title,
      ),
    );
  };
  return React.createElement(
    "div",
    {
      className:
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all duration-300",
      onClick: onClose,
    },
    React.createElement(
      "div",
      {
        className:
          "relative w-full max-w-[1600px] max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
        onClick: function (e) {
          return e.stopPropagation();
        },
      },
      React.createElement(
        "div",
        {
          className:
            "flex items-start justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10",
        },
        React.createElement(
          "div",
          { className: "flex items-center gap-4" },
          React.createElement(
            "div",
            {
              className:
                "h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white",
            },
            React.createElement(lucide_react_1.FileText, { size: 24 }),
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "h3",
              { className: "text-xl font-bold text-gray-900 dark:text-white" },
              "\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E41\u0E1A\u0E1A\u0E2A\u0E33\u0E23\u0E27\u0E08",
            ),
            React.createElement(
              "p",
              {
                className: "text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1",
              },
              React.createElement(lucide_react_1.Calendar, { size: 12 }),
              " \u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E40\u0E21\u0E37\u0E48\u0E2D:",
              " ",
              formatDate(suvery.submittedAt || suvery.createdAt),
            ),
          ),
        ),
        React.createElement(
          "button",
          {
            onClick: onClose,
            className:
              "p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors dark:hover:bg-gray-800 dark:hover:text-gray-300",
          },
          React.createElement(lucide_react_1.X, { size: 24 }),
        ),
      ),
      React.createElement(
        "div",
        {
          className:
            "flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700",
        },
        React.createElement(
          "div",
          {
            className:
              "mb-8 p-4 rounded-2xl bg-linear-to-r from-gray-50 to-white border border-gray-100 dark:from-gray-800 dark:to-gray-800/50 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4",
          },
          React.createElement(
            "div",
            null,
            React.createElement(
              "p",
              { className: "text-sm text-gray-500 dark:text-gray-400 mb-1" },
              "\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E15\u0E2D\u0E1A\u0E41\u0E1A\u0E1A\u0E2A\u0E33\u0E23\u0E27\u0E08",
            ),
            React.createElement(
              "h2",
              { className: "text-2xl font-bold text-gray-900 dark:text-white" },
              suvery.fullName,
            ),
          ),
          React.createElement(
            "div",
            {
              className:
                "px-4 py-2 rounded-xl text-sm font-bold shadow-sm " +
                (suvery.currentStatus === "ทำงานแล้ว"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : suvery.currentStatus === "ศึกษาต่อ"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-red-100 text-red-700 border border-red-200"),
            },
            suvery.currentStatus,
          ),
        ),
        React.createElement(SectionHeader, {
          title: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27",
          icon: lucide_react_1.User,
        }),
        React.createElement(
          "div",
          {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4 mb-2",
          },
          React.createElement(DataRow, {
            label: "\u0E23\u0E2B\u0E31\u0E2A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32",
            value: suvery.studentId,
          }),
          React.createElement(DataRow, {
            label: "\u0E2B\u0E49\u0E2D\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19",
            value: suvery.roomId,
          }),
          React.createElement(DataRow, {
            label: "\u0E2D\u0E32\u0E22\u0E38",
            value: suvery.age ? suvery.age + " \u0E1B\u0E35" : null,
          }),
          React.createElement(DataRow, {
            label: "\u0E40\u0E1E\u0E28",
            value: suvery.gender,
          }),
          React.createElement(DataRow, {
            label: "\u0E20\u0E39\u0E21\u0E34\u0E25\u0E33\u0E40\u0E19\u0E32",
            value: suvery.homeProvince,
          }),
        ),
        React.createElement(SectionHeader, {
          title:
            "\u0E01\u0E32\u0E23\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D & \u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48",
          icon: lucide_react_1.MapPin,
        }),
        React.createElement(
          "div",
          { className: "grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-2" },
          React.createElement(
            "div",
            { className: "flex items-center gap-2 col-span-1" },
            React.createElement(lucide_react_1.Phone, {
              size: 16,
              className: "text-gray-400",
            }),
            React.createElement(
              "span",
              { className: "text-gray-800 dark:text-gray-200 font-medium" },
              suvery.contactTel || "-",
            ),
          ),
          React.createElement(
            "div",
            { className: "flex items-center gap-2 col-span-1" },
            React.createElement(lucide_react_1.Mail, {
              size: 16,
              className: "text-gray-400",
            }),
            React.createElement(
              "span",
              { className: "text-gray-800 dark:text-gray-200 font-medium" },
              suvery.contactEmail || "-",
            ),
          ),
          React.createElement(DataRow, {
            label: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48",
            value: [
              suvery.addrNumber,
              suvery.addrBuilding,
              suvery.addrMoo ? "\u0E21." + suvery.addrMoo : null,
              suvery.addrSoi,
              suvery.addrRoad,
              suvery.addrSubDistrict,
              suvery.addrDistrict,
              suvery.addrProvince,
              suvery.addrZipCode,
            ]
              .filter(Boolean)
              .join(" "),
            fullWidth: true,
          }),
        ),
        React.createElement(SectionHeader, {
          title:
            "\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32",
          icon: lucide_react_1.GraduationCap,
        }),
        React.createElement(
          "div",
          { className: "grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4 mb-2" },
          React.createElement(DataRow, {
            label:
              "\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32\u0E17\u0E35\u0E48\u0E08\u0E1A",
            value: suvery.educationLevel,
          }),
          React.createElement(DataRow, {
            label:
              "\u0E1B\u0E35\u0E17\u0E35\u0E48\u0E08\u0E1A\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32",
            value: suvery.graduationYear,
          }),
          React.createElement(DataRow, {
            label: "\u0E40\u0E01\u0E23\u0E14\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22 (GPA)",
            value: suvery.gpa,
          }),
        ),
        suvery.currentStatus === "ทำงานแล้ว" &&
          React.createElement(
            React.Fragment,
            null,
            React.createElement(SectionHeader, {
              title:
                "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E17\u0E33\u0E07\u0E32\u0E19",
              icon: lucide_react_1.Briefcase,
            }),
            React.createElement(
              "div",
              {
                className: "grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-2",
              },
              React.createElement(DataRow, {
                label: "\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07\u0E07\u0E32\u0E19",
                value: suvery.jobTitle,
              }),
              React.createElement(DataRow, {
                label: "\u0E2A\u0E16\u0E32\u0E19\u0E17\u0E35\u0E48\u0E17\u0E33\u0E07\u0E32\u0E19",
                value: suvery.workplaceName,
              }),
              React.createElement(DataRow, {
                label:
                  "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E07\u0E32\u0E19",
                value: suvery.employmentType,
              }),
              React.createElement(DataRow, {
                label: "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E2D\u0E37\u0E48\u0E19\u0E46",
                value: suvery.employmentTypeOther,
              }),
              React.createElement(DataRow, {
                label: "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49",
                value: suvery.salaryRange,
              }),
              React.createElement(DataRow, {
                label: "\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49 (\u0E23\u0E30\u0E1A\u0E38)",
                value: suvery.salaryRangeOther,
              }),
              React.createElement(DataRow, {
                label:
                  "\u0E15\u0E23\u0E07\u0E2A\u0E32\u0E22\u0E07\u0E32\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48",
                value: suvery.jobMatch,
              }),
              React.createElement(DataRow, {
                label: "\u0E04\u0E27\u0E32\u0E21\u0E1E\u0E36\u0E07\u0E1E\u0E2D\u0E43\u0E08",
                value: suvery.jobSatisfaction,
              }),
              React.createElement(DataRow, {
                label:
                  "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E17\u0E35\u0E48\u0E17\u0E33\u0E07\u0E32\u0E19",
                value: [
                  suvery.workplaceAddrNumber,
                  suvery.workplaceAddrMoo,
                  suvery.workplaceAddrSoi,
                  suvery.workplaceAddrRoad,
                  suvery.workplaceAddrSubDistrict,
                  suvery.workplaceAddrDistrict,
                  suvery.workplaceAddrProvince,
                  suvery.workplaceAddrZipCode,
                ]
                  .filter(Boolean)
                  .join(" "),
                fullWidth: true,
              }),
            ),
          ),
        (suvery.currentStatus === "ศึกษาต่อ" ||
          suvery.furtherStudyIntention === "ต้องการศึกษาต่อ") &&
          React.createElement(
            React.Fragment,
            null,
            React.createElement(SectionHeader, {
              title:
                "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32\u0E15\u0E48\u0E2D",
              icon: lucide_react_1.GraduationCap,
            }),
            React.createElement(
              "div",
              {
                className: "grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-2",
              },
              React.createElement(DataRow, {
                label: "\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23",
                value: suvery.furtherStudyIntention,
              }),
              React.createElement(DataRow, {
                label: "\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E0A\u0E31\u0E49\u0E19",
                value: suvery.furtherStudyLevel,
              }),
              React.createElement(DataRow, {
                label: "\u0E2A\u0E32\u0E02\u0E32\u0E27\u0E34\u0E0A\u0E32",
                value: suvery.furtherStudyMajor,
              }),
              React.createElement(DataRow, {
                label: "\u0E2A\u0E32\u0E02\u0E32 (\u0E23\u0E30\u0E1A\u0E38)",
                value: suvery.furtherStudyMajorDetail,
              }),
              React.createElement(DataRow, {
                label: "\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25",
                value: suvery.furtherStudyReason,
                fullWidth: true,
              }),
            ),
          ),
        suvery.currentStatus === "ไม่ได้ทำงาน" &&
          React.createElement(
            React.Fragment,
            null,
            React.createElement(SectionHeader, {
              title:
                "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E27\u0E48\u0E32\u0E07\u0E07\u0E32\u0E19",
              icon: lucide_react_1.User,
            }),
            React.createElement(
              "div",
              {
                className: "grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-2",
              },
              React.createElement(DataRow, {
                label: "\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E2B\u0E25\u0E31\u0E01",
                value: suvery.notWorkingReasonGroup,
              }),
              React.createElement(DataRow, {
                label:
                  "\u0E1B\u0E31\u0E0D\u0E2B\u0E32\u0E43\u0E19\u0E01\u0E32\u0E23\u0E2B\u0E32\u0E07\u0E32\u0E19",
                value: suvery.jobSearchProblem,
              }),
              React.createElement(DataRow, {
                label:
                  "\u0E2A\u0E32\u0E40\u0E2B\u0E15\u0E38\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14",
                value: suvery.unemployedReason,
              }),
              React.createElement(DataRow, {
                label: "\u0E2A\u0E32\u0E40\u0E2B\u0E15\u0E38\u0E2D\u0E37\u0E48\u0E19",
                value: suvery.unemployedReasonOther,
              }),
            ),
          ),
        hasValue(suvery.suggestion) &&
          React.createElement(
            "div",
            {
              className:
                "mt-8 p-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-900/30",
            },
            React.createElement(
              "h5",
              {
                className:
                  "font-bold text-yellow-800 dark:text-yellow-500 mb-2 flex items-center gap-2",
              },
              React.createElement(lucide_react_1.FileText, { size: 18 }),
              " \u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D\u0E41\u0E19\u0E30",
            ),
            React.createElement(
              "p",
              { className: "text-gray-700 dark:text-gray-300 italic" },
              '"',
              suvery.suggestion,
              '"',
            ),
          ),
      ),
      React.createElement(
        "div",
        {
          className:
            "p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end",
        },
        React.createElement(
          "button",
          {
            onClick: onClose,
            className:
              "px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-gray-200 dark:shadow-none dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",
          },
          "\u0E1B\u0E34\u0E14\u0E2B\u0E19\u0E49\u0E32\u0E15\u0E48\u0E32\u0E07",
        ),
      ),
    ),
  );
};
exports["default"] = SuveryDetailModal;
