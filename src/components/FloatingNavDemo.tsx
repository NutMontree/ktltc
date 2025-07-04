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
                <FloatButton icon={<CommentOutlined />} href='https://line.me/ti/g2/lE1gdiKYbUTFrBCjWTUY7DjOQx2dSw2QPAv4fw?utm_source=invitation&utm_medium=QR_code&utm_campaign=default' tooltip={<div>LINE OPENCHAT</div>} />
            </FloatButton.Group>
        </div>

    </>
);

export default FloatingNavDemo;

