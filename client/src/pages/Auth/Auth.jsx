import React, { useState } from "react";
import "./Auth.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, message as notice } from "antd";
import * as AuthApi from "../../api/AuthRequests";

const Auth = () => {
  const [messageApi, contextHolder] = notice.useMessage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSignUp, setIsSignUp] = useState(false);

  const [confirmPass, setConfirmPass] = useState(true);

  const [form] = Form.useForm();

  const resetForm = () => {
    form.resetFields();
  };

  const onFinish = async (values) => {
    dispatch({ type: "AUTH_START" });
    if (isSignUp) {
      try {
        const { data } = await AuthApi.signUp(values);
        dispatch({ type: "AUTH_SUCCESS", data: data });
        messageApi.success("Đăng ký tài khoản thành công");
        navigate("../home", { replace: true });
      } catch (error) {
        messageApi.info(error.response.data.message);
        dispatch({ type: "AUTH_FAIL" });
      }
    } else {
      try {
        const { data } = await AuthApi.logIn(values);
        dispatch({ type: "AUTH_SUCCESS", data: data });
        messageApi.success("Đăng nhập thành công");
        navigate("../home", { replace: true });
      } catch (error) {
        dispatch({ type: "AUTH_FAIL" });
        messageApi.info("Sai tài khoản hoặc mật khẩu");
      }
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="Auth">
      {contextHolder}
      <div className="a-right" style={{ width: "600px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          className="authForm form"
          style={{ width: "100%" }}
        >
          <h3 style={{ fontSize: "28px", textAlign: "center" }}>
            {isSignUp ? "Register" : "Login"}
          </h3>
          {isSignUp && (
            <div style={{ display: "flex", gap: "1rem" }}>
              <Form.Item
                label="First name"
                name="firstname"
                rules={[
                  {
                    required: true,
                    message: "Please input your first name!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Last name"
                name="lastname"
                rules={[
                  {
                    required: true,
                    message: "Please input your last name!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </div>
          )}
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <div style={{ display: "flex", gap: "1rem" }}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
                {
                  min: 8,
                  message: "Password has at least 8 characters!",
                },
                {
                  max: 24,
                  message: "Password has a maximum of 24 characters!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            {isSignUp && (
              <Form.Item
                label="Confirm Password"
                name="confirmpass"
                dependencies={['password']}
                rules={[
                  {
                    required: true,
                    message: "Please input confirm password!",
                  },
                  {
                    min: 8,
                    message: "Password has at least 8 characters!",
                  },
                  {
                    max: 24,
                    message: "Password has a maximum of 24 characters!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The new password that you entered do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexDirection: "column",
              marginTop: "20px",
            }}
          >
            <Button type="primary" htmlType="submit">
              Log in
            </Button>
            <span
              style={{
                fontSize: "12px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => {
                resetForm();
                setIsSignUp((prev) => !prev);
              }}
            >
              {isSignUp
                ? "Already have an account Login"
                : "Don't have an account Sign up"}
            </span>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Auth;
