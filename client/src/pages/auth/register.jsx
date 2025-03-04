import { Form, Button, Input } from "antd";
import { useDispatch} from "react-redux";
import { registerUser } from "@/store/auth-slice";
import { useToast } from "@/components/ui/use-toast";

export const Signup = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { toast } = useToast();
    const onFinish = (formData) => {
        dispatch(registerUser(formData)).then((data) => {
            if (data?.payload?.success) {
              toast({
                title: data?.payload?.message,
              });
              navigate("/shop/home");
            } else {
              toast({
                title: data?.payload?.message,
                variant: "destructive",
              });
            }
          });
    }

    return (
        <Form form={form} className="form" layout="vertical" onFinish={onFinish}>
            <Form.Item
                name="email"
                label="Email"
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
                name="userName"
                label="Username"
                placeholder= "Enter your username"
                rules={[
                    { required: true, message: "Username is required" }
                ]}
                className="form-item"
            >
                <Input placeholder="Name" />
            </Form.Item>
            <Form.Item
                name="password"
                label="Password"
                placeholder="Enter your password"
                rules={[
                    { required: true, message: "password is required" }
                ]}
                className="form-item"
            >
                <Input.Password placeholder="Password" />
            </Form.Item>
            <Button className="wine-button" htmlType="submit" block size="large"
          style={{ fontWeight: 600 }} >Signup</Button>
        </Form>
           );
}

export default Signup;