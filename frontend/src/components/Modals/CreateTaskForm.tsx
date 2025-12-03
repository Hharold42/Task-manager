import { Flex, Form, Input, Select, Tooltip, type FormInstance } from 'antd';
import type { User } from '../../api/types';
import { InfoCircleOutlined } from '@ant-design/icons';

interface Props {
    form: FormInstance;
    users: User[];
    loadingUsers?: boolean;
}

export default function CreateTaskForm({ form, users, loadingUsers }: Props) {
    return (
        <Form layout="vertical" form={form}>
            <Flex vertical gap={4}>
                <label>Название задачи</label>
                <Form.Item
                    name="title"
                    rules={[{ required: true, message: 'Введите название' }]}
                >
                    <Input autoComplete="off" maxLength={200} showCount />
                </Form.Item>
            </Flex>

            <Flex vertical gap={4}>
                <label>Описание</label>
                <Form.Item
                    name="description"
                    rules={[{ max: 2000, message: 'Максимум 2000 символов' }]}
                >
                    <Input.TextArea rows={4} placeholder="Кратко опишите задачу" />
                </Form.Item>
            </Flex>

            <Flex vertical gap={4}>
                <label>
                    Исполнитель{' '}
                    <Tooltip title="Если не выбрать, назначим случайного">
                        <InfoCircleOutlined />
                    </Tooltip>
                </label>
                <Form.Item name="assigneeId">
                    <Select
                        allowClear
                        loading={loadingUsers}
                        placeholder="Оставьте пустым для случайного назначения"
                        options={users.map((u) => ({ label: u.email, value: u.id }))}
                    />
                </Form.Item>
            </Flex>
        </Form>
    );
}