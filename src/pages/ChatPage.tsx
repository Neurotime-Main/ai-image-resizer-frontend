import { useCallback, useEffect, useRef, useState } from 'react';
import { App as AntApp, Skeleton, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import Composer, { ComposerSubmit } from '../components/Composer';
import GenerationBlock from '../components/GenerationBlock';
import { extractErrorMessage } from '../api/client';
import { fetchChat, generateBanners } from '../api/chats';
import { useChats } from '../context/ChatsContext';
import { Generation, TargetSize } from '../types';

interface PendingRequest {
  previewUrl: string;
  description: string;
  sizes: TargetSize[];
}

export default function ChatPage() {
  const { chatId: chatIdParam } = useParams();
  const chatId = chatIdParam ? Number(chatIdParam) : null;
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const { upsertChat } = useChats();

  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pending, setPending] = useState<PendingRequest | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  // Chat we just created locally — its data is already in state, so skip the refetch.
  const seededChatRef = useRef<number | null>(null);
  const pendingObjectUrlRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }));
  }, []);

  useEffect(() => {
    if (chatId === null) {
      setGenerations([]);
      return;
    }
    if (seededChatRef.current === chatId) {
      seededChatRef.current = null;
      return;
    }
    let cancelled = false;
    setLoadingChat(true);
    fetchChat(chatId)
      .then((data) => {
        if (cancelled) return;
        setGenerations(data.generations);
        scrollToBottom();
      })
      .catch((error) => {
        if (cancelled) return;
        message.error(extractErrorMessage(error));
        navigate('/app', { replace: true });
      })
      .finally(() => {
        if (!cancelled) setLoadingChat(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chatId, message, navigate, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (pendingObjectUrlRef.current) URL.revokeObjectURL(pendingObjectUrlRef.current);
    };
  }, []);

  const existingBannerUrl = generations.length > 0 ? generations[generations.length - 1].originalUrl : null;

  const handleSubmit = async ({ file, description, sizes }: ComposerSubmit) => {
    const previewUrl = file ? URL.createObjectURL(file) : existingBannerUrl;
    if (!previewUrl) return;
    if (file) pendingObjectUrlRef.current = previewUrl;

    setGenerating(true);
    setPending({ previewUrl, description, sizes });
    scrollToBottom();

    try {
      const data = await generateBanners({ chatId, file, description, sizes });
      upsertChat(data.chat);

      if (chatId === null) {
        seededChatRef.current = data.chat.id;
        setGenerations([data.generation]);
        navigate(`/app/c/${data.chat.id}`, { replace: true });
      } else {
        setGenerations((current) => [...current, data.generation]);
      }

      const done = data.generation.results.filter((result) => result.status === 'done').length;
      const failed = data.generation.results.length - done;
      if (failed === 0) {
        message.success(`Generated ${done} banner${done === 1 ? '' : 's'}.`);
      } else if (done > 0) {
        message.warning(`Generated ${done} banner${done === 1 ? '' : 's'}, ${failed} failed.`);
      } else {
        message.error('All generations failed. Please try again.');
      }
      scrollToBottom();
    } catch (error) {
      message.error(extractErrorMessage(error));
    } finally {
      setGenerating(false);
      setPending(null);
      if (pendingObjectUrlRef.current) {
        URL.revokeObjectURL(pendingObjectUrlRef.current);
        pendingObjectUrlRef.current = null;
      }
    }
  };

  const isEmptyNewChat = chatId === null && !pending;

  return (
    <div className={`chat-page${isEmptyNewChat ? ' chat-page-empty' : ''}`}>
      <div className="chat-stream">
        {isEmptyNewChat && (
          <div className="studio-hero">
            <h1>Adapt your banner to any size</h1>
            <p>Upload a banner, choose sizes, generate.</p>
          </div>
        )}

        {loadingChat ? (
          <div style={{ padding: '12px 0' }}>
            <Skeleton active avatar paragraph={{ rows: 3 }} />
            <Skeleton active avatar paragraph={{ rows: 3 }} style={{ marginTop: 32 }} />
          </div>
        ) : (
          generations.map((generation) => (
            <GenerationBlock
              key={generation.id}
              originalUrl={generation.originalUrl}
              originalWidth={generation.originalWidth}
              originalHeight={generation.originalHeight}
              description={generation.description}
              sizes={generation.sizes}
              createdAt={generation.createdAt}
              results={generation.results}
            />
          ))
        )}

        {pending && (
          <GenerationBlock
            originalUrl={pending.previewUrl}
            description={pending.description}
            sizes={pending.sizes}
            pending
          />
        )}

        {!loadingChat && generations.length === 0 && !pending && chatId !== null && (
          <Typography.Text type="secondary">This chat has no generations yet.</Typography.Text>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="composer-dock">
        <Composer existingBannerUrl={existingBannerUrl} generating={generating} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
