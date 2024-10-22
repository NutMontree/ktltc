"use client"; // top to the file

// import React from "react";
// import { Flex, Table } from "antd";
// import type { TableColumnsType } from "antd";

// interface FixedDataType {
//   key: string;
//   name: string;
//   borrow: number;
//   repayment: number;
//   man: string;
//   female: string;
//   end: string;
//   out: string;
//   sum: string;
// }

// const fixedColumns: TableColumnsType<FixedDataType> = [
//   {
//     title: "ระดับการศึกษา",
//     dataIndex: "name",
//   },
//   {
//     title: "ชาย",
//     dataIndex: "man",
//   },
//   {
//     title: "หญิง",
//     dataIndex: "female",
//   },
//   {
//     title: "จบ",
//     dataIndex: "end",
//   },
//   {
//     title: "พ้นสภาพ",
//     dataIndex: "out",
//   },
//   {
//     title: "รวม",
//     dataIndex: "sum",
//   },
// ];

// const fixedDataSource = [
//   {
//     key: "1",
//     name: "ระดับ ปวช",
//     borrow: 10,
//     repayment: 33,
//     man: "998",
//     female: "650",
//     end: "0",
//     out: "0",
//     sum: "1,648",
//   },
//   {
//     key: "2",
//     name: "ระดับ ปสว",
//     borrow: 100,
//     repayment: 0,
//     man: "496",
//     female: "358",
//     end: "0",
//     out: "0",
//     sum: "854",
//   },
//   {
//     key: "3",
//     name: "ระดับ ทล.บ",
//     borrow: 10,
//     repayment: 10,
//     man: "0",
//     female: "0",
//     end: "0",
//     out: "0",
//     sum: "0",
//   },
// ];

const Sid: React.FC = () => {
  return (
    <>
      <div>
        <h1 className="flex justify-center text-xl ">
          ข้อมูลนักเรียน นักศึกษา
        </h1>
        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
          Student information
        </h1>
      </div>

      {/* <Flex vertical gap="small">
        <Table<FixedDataType>
          columns={fixedColumns}
          dataSource={fixedDataSource}
          pagination={false}
          scroll={{ x: 600, y: 300 }}
          bordered
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell className="flex justify-end" index={0}>
                  รวมทั้งหมด
                </Table.Summary.Cell>
                <Table.Summary.Cell className="text-sky-700" index={1}>
                  <div className="flex justify-end">1,494</div>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="text-sky-700" index={2}>
                  <div className="flex justify-end">1,008</div>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="text-sky-700" index={3}>
                  <div className="flex justify-end">0</div>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="text-sky-700" index={4}>
                  <div className="flex justify-end">0</div>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="text-sky-700" index={5}>
                  <div className="flex justify-end">2,502</div>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Flex> */}

      <div className="pt-6 rounded-lg">
        <div className="grid grid-cols-6 bg-zinc-100 rounded-tl-lg rounded-tr-lg border-slate-100 dark:bg-slate-800">
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base font-medium text-center px-3 py-3 border-slate-200 border-t-1 border-l-1 rounded-tl-lg  ">
            ระดับการศึกษา
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base font-medium text-center px-3 py-3 border-slate-200 border-t-1 border-l-1 ">
            ชาย
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base font-medium text-center px-3 py-3 border-slate-200 border-t-1 border-l-1 ">
            หญิง
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base font-medium text-center px-3 py-3 border-slate-200 border-t-1 border-l-1 ">
            จบ
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base font-medium text-center px-3 py-3 border-slate-200 border-t-1 border-l-1 ">
            พ้นสภาพ
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base font-medium text-center px-3 py-3 border-slate-200 border-t-1 border-l-1 border-r-1 rounded-tr-lg">
            รวม
          </div>
        </div>
        <div className="grid grid-cols-6 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 border-slate-100 border-t-1 border-l-1 ">
            ระดับ ปวช
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            998
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            650
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            0
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            0
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1 border-r-1">
            1,648
          </div>
        </div>
        <div className="grid grid-cols-6 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 border-slate-100 border-t-1 border-l-1">
            ระดับ ปสว
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            496
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            358
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            0
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            0
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1 border-r-1">
            854
          </div>
        </div>
        <div className="grid grid-cols-6 border-slate-200 hover:bg-zinc-50 dark:hover:bg-slate-800">
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 border-slate-100 border-t-1 border-l-1">
            ระดับ ทล.บ
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            0
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            0
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            4
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1">
            0
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1 border-r-1">
            0
          </div>
        </div>
        <div className="grid grid-cols-6 border-slate-200 rounded-bl-lg rounded-br-lg dark:hover:bg-slate-800">
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1 border-b-1 rounded-bl-lg dark:hover:text-white">
            รวมทั้งหมด
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base text-sky-600 px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1  border-b-1 dark:hover:text-white">
            1,494
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base text-sky-600 px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1  border-b-1 dark:hover:text-white">
            1,008
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base text-sky-600 px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1  border-b-1 dark:hover:text-white">
            0
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base text-sky-600 px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1  border-b-1 dark:hover:text-white">
            0
          </div>
          <div className="text-[8px] sm:text-sm md:text-base lg:text-base text-sky-600 px-3 py-3 text-end  border-slate-100 border-t-1 border-l-1 border-b-1 border-r-1 rounded-br-lg dark:hover:text-white">
            2,502
          </div>
        </div>
      </div>
    </>
  );
};

export default Sid;
