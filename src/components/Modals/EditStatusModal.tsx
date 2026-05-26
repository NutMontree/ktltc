import { Modal, Form, Input, Button } from 'antd';
import React from 'react';

interface EditStatusModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (values: { status: string; score?: string; note?: string }) => void;
  initialValues?: { status: string; score?: string; note?: string };
  title?: string;
}

export const EditStatusModal: React.FC<EditStatusModalProps> = ({
  open,
  onCancel,
  onSave,
  initialValues = { status: '' },
  title = 'แก้ไขสถานะ',
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (err) {
      // validation errors are handled by Ant Design
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      onOk={handleOk}
      footer={null}
      className="bg-white/10 backdrop-blur-lg border border-white/20"
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="status"
          label="สถานะ"
          rules={[{ required: true, message: 'กรุณาเลือกสถานะ' }]}
        >
          <Input placeholder="เช่น กำลังศึกษา" />
        </Form.Item>
        <Form.Item name="score" label="คะแนน (ตัวเลือก)">
          <Input placeholder="เช่น 85" />
        </Form.Item>
        <Form.Item name="note" label="หมายเหตุ (ตัวเลือก)">
          <Input.TextArea rows={3} placeholder="หมายเหตุเพิ่มเติม" />
        </Form.Item>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onCancel}>ยกเลิก</Button>
          <Button type="primary" onClick={handleOk}>บันทึก</Button>
        </div>
      </Form>
    </Modal>
  );
};
