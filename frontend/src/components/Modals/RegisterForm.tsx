import { Flex, Form, Input, type FormInstance } from 'antd';

export default function RegisterForm({ form }: { form: FormInstance }) {
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
          rules={[{ required: true, message: 'Введите пароль' }, { min: 8 }]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Flex>

      <Flex vertical gap={4}>
        <label>Повторите пароль</label>
        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Повторите пароль' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Пароли должны совпадать'));
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Flex>
    </Form>
  );
}