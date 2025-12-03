import { Button, Flex, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import styles from './TaskChip.module.scss';

interface TaskChipProps {
  id: number;
  title: string;
  description?: string | null;
  createdAt?: string;
  authorEmail?: string;
  assigneeEmail?: string;
  canEdit?: boolean;
  onEdit?: () => void;
}

export default function TaskChip({
  id,
  title,
  description,
  createdAt,
  authorEmail,
  assigneeEmail,
  canEdit,
  onEdit,
}: TaskChipProps) {
    // :D
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percentX = Math.min(Math.max((offsetX / rect.width) * 100, 0), 100);
    target.style.setProperty('--glow-x', `${percentX}%`);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--glow-x', '50%');
  };

  return (
    <Flex
      vertical
      key={id}
      className={styles.root}
      gap={8}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.actions}>
          <Typography.Text className={styles.idTag}>#{id}</Typography.Text>
          {canEdit && onEdit && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={onEdit}
            />
          )}
        </div>
      </div>
      <div className={styles.content}>
        {description && <div className={styles.taskDescription}>{description}</div>}
        <Flex className={styles.metaRow}>
          {authorEmail && <div>Автор: {authorEmail}</div>}
          {assigneeEmail && <div>Исполнитель: {assigneeEmail}</div>}
          {createdAt && (
            <div>Создана: {new Date(createdAt).toLocaleString('ru-RU')}</div>
          )}
        </Flex>
      </div>
    </Flex>
  );
}