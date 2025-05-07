// "use client"; // top to the file

// import React from "react";

// import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";
// import { FloatingNav } from "@/components/ui/floating-navbar";

// export function FloatingNavDemo() {
//   const navItems = [
//     {
//       name: "Home",
//       link: "/",
//       icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
//     },
//     {
//       name: "About",
//       link: "/about",
//       icon: <IconUser className="h-4 w-4 text-neutral-500 dark:text-white" />,
//     },
//     {
//       name: "Contact",
//       link: "/contact",
//       icon: (
//         <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />
//       ),
//     },
//   ];
//   return (
//     <div className="relative  w-full">
//       <FloatingNav navItems={navItems} />
//     </div>
//   );
// }
import React from 'react';
import { CommentOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';

const FloatingNavDemo: React.FC = () => (
    <>
        <div className=' '>
            <FloatButton.Group
                trigger="hover"
                type="primary"
                style={{ insetInlineEnd: 24, bottom: 24 }}
                icon={<QuestionCircleOutlined />}
            >
                {/* <FloatButton tooltip={<div>Documents</div>} /> */}
                <FloatButton icon={<CommentOutlined />} href='https://line.me/ti/g2/lE1gdiKYbUTFrBCjWTUY7DjOQx2dSw2QPAv4fw?utm_source=invitation&utm_medium=QR_code&utm_campaign=default' tooltip={<div>Mesganger</div>} />
            </FloatButton.Group>
        </div>

    </>
);

export default FloatingNavDemo;

