// Students go on internships
"use client"; // top to the file
import { AntDesignOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Space } from 'antd';
import { createStyles } from 'antd-style';
import Link from "next/link";


const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));
export default function SubInternships() {
    const { styles } = useStyle();
    return (
        <>
            <div className="relative z-10 overflow-hidden pb-[60px] pt-[100px] ">
                <div className="from-stroke/0 via-stroke to-stroke/0 absolute bottom-0 left-0 h-px w-full bg-gradient-to-r"></div>
                <div className="w-full">
                    <div className="text-center">
                        <h1 className="flex justify-center text-xl ">นักศึกษาออกฝึกประสบการณ์</h1>
                        <h1 className="flex justify-center text-xl text-[#DAA520] pb-8">
                            Students go on internship
                        </h1>
                        <ul className="flex items-center justify-center gap-[10px]">
                            <li>
                                <Link
                                    href="/"
                                    className="text-dark flex items-center gap-[10px] text-base font-medium dark:text-white"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <p className="text-body-color flex items-center gap-[10px] text-base font-medium">
                                    <span className="text-body-color dark:text-dark-6">
                                        /
                                    </span>
                                    Internship
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div >

            <div className="pt-20">
                <div className="grid gap-4">
                    <div>
                        <Link href='/internships/SubInternships/2568'>
                            <ConfigProvider
                                button={{
                                    className: styles.linearGradientButton,
                                }}
                            >
                                <Space>
                                    <Button type="primary" size="large" icon={<AntDesignOutlined />}>
                                        2568
                                    </Button>
                                </Space>
                            </ConfigProvider>
                        </Link>
                    </div>
                </div>
            </div>
        </>)
}
