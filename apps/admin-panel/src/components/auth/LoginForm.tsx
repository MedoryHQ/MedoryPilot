import { Form, Input, Button, Checkbox } from "antd";
import { useMutation } from "react-query";
import { LoginFormValues, ResponseError } from "@/types";
import { returnError, setFormErrors, toUpperCase } from "@/utils";
import axios from "@/api/axios";
import useApp from "antd/es/app/useApp";

const UserIcon = () => <span style={{ color: "#9ca3af" }}>👤</span>;
const LockIcon = () => <span style={{ color: "#9ca3af" }}>🔒</span>;

interface Props {
  onSuccess: (email: string) => void;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

const LoginForm = ({ onSuccess, setEmail }: Props) => {
  const [form] = Form.useForm();
  const { message } = useApp();

  const { mutate, isLoading } = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { data } = await axios.post(`/auth/login`, values);
      return data;
    },
    onSuccess: (data, variables) => {
      form.resetFields();
      message.success(toUpperCase(data.message["en"]));
      onSuccess(variables.email);
    },
    onError: (error: ResponseError) => {
      console.log(error);
      setFormErrors(error, message, form);
      returnError(error, "Login failed");
    }
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setEmail(values.email);
      mutate(values);
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  return (
    <Form
      form={form}
      name="login"
      layout="vertical"
      size="large"
      className="flex flex-1 flex-col justify-between"
      onFinish={() => {
        handleSubmit();
      }}
      initialValues={{ remember: true }}
    >
      <fieldset>
        <Form.Item
          name="email"
          label="Email"
          className="!mb-4"
          rules={[
            { required: true, message: "Email Required" },
            { type: "email", message: "Invalid Email" }
          ]}
        >
          <Input
            prefix={<UserIcon />}
            placeholder="Email"
            className="rounded-lg"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Password Required" }]}
        >
          <Input.Password
            prefix={<LockIcon />}
            placeholder="Password"
            className="rounded-lg"
          />
        </Form.Item>
      </fieldset>
      <footer>
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Remember Me</Checkbox>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          className="w-full rounded-lg"
        >
          Login
        </Button>
      </footer>
    </Form>
  );
};

export default LoginForm;
