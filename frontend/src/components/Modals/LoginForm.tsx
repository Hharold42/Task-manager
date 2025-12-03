import { Flex, Form, Input, type FormInstance } from 'antd';

export default function LoginForm({ form }: { form: FormInstance }) {
  return (
    <Form form={form} layout="vertical">
      <Flex vertical gap={4}>
        <label>Эл. почта</label>
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Введите email' }, { type: 'email' }]}
        >
          <Input autoComplete="email" />
        </Form.Item>
      </Flex>

      <Flex vertical gap={4}>
        <label>Пароль</label>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>
      </Flex>
    </Form>
  );
}