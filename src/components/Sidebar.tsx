import { useState } from 'react';
import { App as AntApp, Button, Dropdown, Empty, Input, Modal, Skeleton, Typography } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  MoreOutlined,
  PlusOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useChats } from '../context/ChatsContext';
import { extractErrorMessage } from '../api/client';
import { Chat } from '../types';

function groupLabel(updatedAt: string): string {
  // SQLite returns "YYYY-MM-DD HH:MM:SS" in UTC.
  const date = new Date(`${updatedAt.replace(' ', 'T')}Z`);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.floor((startOfToday.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return 'Previous 7 days';
  if (days < 30) return 'Previous 30 days';
  return 'Older';
}

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { chats, loading, removeChat, rename } = useChats();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { message, modal } = AntApp.useApp();
  const [renaming, setRenaming] = useState<Chat | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [savingRename, setSavingRename] = useState(false);

  const activeId = chatId ? Number(chatId) : null;

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const confirmDelete = (chat: Chat) => {
    modal.confirm({
      title: 'Delete this chat?',
      content: `"${chat.title}" and all of its generated banners will be permanently removed.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await removeChat(chat.id);
          message.success('Chat deleted.');
          if (activeId === chat.id) navigate('/app');
        } catch (error) {
          message.error(extractErrorMessage(error));
        }
      },
    });
  };

  const submitRename = async () => {
    if (!renaming || !renameValue.trim()) return;
    setSavingRename(true);
    try {
      await rename(renaming.id, renameValue.trim());
      setRenaming(null);
    } catch (error) {
      message.error(extractErrorMessage(error));
    } finally {
      setSavingRename(false);
    }
  };

  let lastGroup = '';

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <button type="button" className="sidebar-brand" onClick={() => go('/app')}>
          <span className="brand-mark">
            <ThunderboltFilled />
          </span>
          <span className="brand-text">BannerAI</span>
        </button>
      </div>

      <div style={{ padding: '0 12px 12px' }}>
        <Button
          className="gradient-btn"
          type="primary"
          icon={<PlusOutlined />}
          block
          onClick={() => go('/app')}
        >
          New chat
        </Button>
      </div>

      <div className="sidebar-list">
        {loading && chats.length === 0 ? (
          <div style={{ padding: '8px 14px' }}>
            <Skeleton active paragraph={{ rows: 4 }} title={false} />
          </div>
        ) : chats.length === 0 ? (
          <div style={{ padding: '28px 16px' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Typography.Text type="secondary">No chats yet</Typography.Text>}
            />
          </div>
        ) : (
          chats.map((chat) => {
            const group = groupLabel(chat.updatedAt);
            const showHeader = group !== lastGroup;
            lastGroup = group;
            return (
              <div key={chat.id}>
                {showHeader && <div className="sidebar-group">{group}</div>}
                <div
                  className={`chat-item${activeId === chat.id ? ' active' : ''}`}
                  onClick={() => go(`/app/c/${chat.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') go(`/app/c/${chat.id}`);
                  }}
                >
                  {chat.thumbUrl ? (
                    <img className="chat-thumb" src={chat.thumbUrl} alt="" />
                  ) : (
                    <span className="chat-thumb chat-thumb-placeholder">
                      <MessageOutlined />
                    </span>
                  )}
                  <span className="chat-title">{chat.title}</span>
                  <Dropdown
                    trigger={['click']}
                    menu={{
                      items: [
                        {
                          key: 'rename',
                          icon: <EditOutlined />,
                          label: 'Rename',
                          onClick: ({ domEvent }) => {
                            domEvent.stopPropagation();
                            setRenaming(chat);
                            setRenameValue(chat.title);
                          },
                        },
                        {
                          key: 'delete',
                          icon: <DeleteOutlined />,
                          label: 'Delete',
                          danger: true,
                          onClick: ({ domEvent }) => {
                            domEvent.stopPropagation();
                            confirmDelete(chat);
                          },
                        },
                      ],
                    }}
                  >
                    <Button
                      type="text"
                      size="small"
                      className="chat-actions"
                      icon={<MoreOutlined />}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </Dropdown>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        open={Boolean(renaming)}
        title="Rename chat"
        onCancel={() => setRenaming(null)}
        onOk={submitRename}
        okText="Save"
        confirmLoading={savingRename}
      >
        <Input
          value={renameValue}
          onChange={(event) => setRenameValue(event.target.value)}
          onPressEnter={submitRename}
          maxLength={120}
          placeholder="Chat title"
        />
      </Modal>
    </aside>
  );
}
