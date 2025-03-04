import Link from "next/link";
import { AntDesignOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Space } from 'antd';
import { createStyles } from 'antd-style';

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


export default function Pressrelease2568() {
  const { styles } = useStyle();
  return (
    <>
      <div className="grid gap-4 pt-1 pb-4">
        <div>
          <ConfigProvider
            button={{
              className: styles.linearGradientButton,
            }}
          >
            <Space>
              <Link className="text-lg text-green-400" href="/pressrelease/2568/press6802">
                <Button type="primary" size="large" icon={<AntDesignOutlined />}>
                  เดือน กุมภาพันธ์ 2568
                </Button>
              </Link>
            </Space>
          </ConfigProvider>
        </div>
        <div>
          <ConfigProvider
            button={{
              className: styles.linearGradientButton,
            }}
          >
            <Space>
              <Link className="text-lg" href="/pressrelease/2568/press6801">
                <Button type="primary" size="large" icon={<AntDesignOutlined />}>
                  เดือน มกราคม 2568
                </Button>
              </Link>
            </Space>
          </ConfigProvider>
        </div>
      </div>
    </>
  );
}
