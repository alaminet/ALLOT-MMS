import React, { useState, useCallback } from "react";
import axios from "axios";
import { Button, Form, Input, InputNumber, Popover, message } from "antd";
import { DiffOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const TakePOSPayment = ({ id, due }) => {
  const user = useSelector((user) => user.loginSlice.login);
  const [formPay] = Form.useForm();
  const [open, setOpen] = useState(false);

  const handleSubmit = useCallback(
    async (values) => {
      try {
        console.log("Payment Data:", values);
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/sales/SalesPOS/update-payment/${id}`,
          values,
          {
            headers: {
              Authorization: import.meta.env.VITE_SECURE_API_KEY,
              token: user?.token,
            },
          },
        );
        message.success("Payment submitted successfully!");
        formPay.resetFields();
        setOpen(false);
      } catch (error) {
        message.error(
          error.response?.data?.error || "Error submitting payment",
        );
      }
    },
    [id, user?.token, formPay],
  );

  const handleOpenChange = (newOpen) => {
    if (newOpen) {
      formPay.setFieldsValue({
        amount: Number(due) || 0,
        payBy: "Cash",
        payRef: "",
      });
    }
    setOpen(newOpen);
  };

  return (
    <>
      <Popover
        content={
          <div style={{ width: "300px" }}>
            <Form
              form={formPay}
              name="formPay"
              layout="vertical"
              onFinish={handleSubmit}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: "Amount is required" }]}>
                <InputNumber
                  placeholder="Amount"
                  min={0}
                  max={due}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item name="payBy" label="Pay By">
                <Input
                  placeholder="Cash, Card, Bank"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item name="payRef" label="Payment Ref.">
                <Input
                  placeholder="Reference (Optional)"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block danger>
                  Confirm Payment
                </Button>
              </Form.Item>
            </Form>
          </div>
        }
        title="Take Payment"
        trigger="click"
        placement="topRight"
        open={open}
        onOpenChange={handleOpenChange}>
        <Button type="primary" icon={<DiffOutlined />}>
          Take Pay
        </Button>
      </Popover>
    </>
  );
};

export default TakePOSPayment;
