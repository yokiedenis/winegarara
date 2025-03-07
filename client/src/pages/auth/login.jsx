import { Form, Input, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { loginUser } from "@/store/auth-slice";
import { Card, CardContent } from "@/components/ui/card";

const AuthLogin = () => {
  // const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [form] = Form.useForm();




  const onFinish = (formData) => {
    console.log("Form Data:", formData);
    dispatch(loginUser(formData)).then((data) => {
      console.log(data)
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
          variant: "success",
        });
        navigate("/shop/home");
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical" className="form">
   
      <Form.Item
        name="email"
        label="Email🂡🍷🍹🥃😊❣️"
        placeholder= "Enter your email"
        rules={[
          { required: true, message: "Email is required" },
          { type: "email", message: "Invalid Email" }
        ]}
        className="form-item"
      >
        <Input placeholder="Email" />
        </Form.Item>
       
         

      <Form.Item
        name="password"
        label="Password⌠ʽ⏑ʼ⌡^_~"
        rules={[
          { required: true, message: "password is required" }
      ]}
      className="form-item"
      >
        <Input.Password placeholder="Password" size="large" />
        </Form.Item>
       
      

      <Button
        htmlType="submit"
        className="wine-button"
        block
        size="large"
        style={{ fontWeight: 600 }}
      >
        Login
      </Button>
    </Form>
  );
};

export default AuthLogin;
