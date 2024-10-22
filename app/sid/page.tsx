"use client"; // top to the file

import React from "react";
import { Flex, Table } from "antd";
import type { TableColumnsType } from "antd";

interface FixedDataType {
  key: string;
  name: string;
  borrow: number;
  repayment: number;
  man: string;
  female: string;
  end: string;
  out: string;
  sum: string;
}

const fixedColumns: TableColumnsType<FixedDataType> = [
  {
    title: "ระดับการศึกษา",
    dataIndex: "name",
  },
  {
    title: "ชาย",
    dataIndex: "man",
  },
  {
    title: "หญิง",
    dataIndex: "female",
  },
  {
    title: "จบ",
    dataIndex: "end",
  },
  {
    title: "พ้นสภาพ",
    dataIndex: "out",
  },
  {
    title: "รวม",
    dataIndex: "sum",
  },
];

const fixedDataSource = [
  {
    key: "1",
    name: "ระดับ ปวช",
    borrow: 10,
    repayment: 33,
    man: "998",
    female: "650",
    end: "0",
    out: "0",
    sum: "1,648",
  },
  {
    key: "2",
    name: "ระดับ ปสว",
    borrow: 100,
    repayment: 0,
    man: "496",
    female: "358",
    end: "0",
    out: "0",
    sum: "854",
  },
  {
    key: "3",
    name: "ระดับ ทล.บ",
    borrow: 10,
    repayment: 10,
    man: "0",
    female: "0",
    end: "0",
    out: "0",
    sum: "0",
  },
];

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
      <Flex vertical gap="small" className="pb-8 rounded-full">
        <div className="bg-red-500 text-center">
          <Table<FixedDataType>
            className="bg-red-500"
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
                  <Table.Summary.Cell className="text-sky-700" index={1}>
                    <div className="flex justify-end">1,008</div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell className="text-sky-700" index={1}>
                    <div className="flex justify-end">0</div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell className="text-sky-700" index={1}>
                    <div className="flex justify-end">0</div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell className="text-sky-700" index={1}>
                    <div className="flex justify-end">2,502</div>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </Flex>
    </>
  );
};

export default Sid;
