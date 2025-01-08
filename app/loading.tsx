import { Flex, Spin } from "antd";
import React from "react";

const contentStyle: React.CSSProperties = {
  padding: 4,
  borderRadius: 4,
};

const content = <div style={contentStyle} />;

export default function loading() {
  return (
    <>
      <div className="justify-items-center text-xxl text-sky-500 py-48">
        <Flex gap="middle" className="" vertical>
          <Flex gap="middle">
            <Spin tip="" size="large">
              {content}
            </Spin>
          </Flex>
        </Flex>
        <div className="pt-4">loading Page ...</div>
      </div>
    </>
  );
}
