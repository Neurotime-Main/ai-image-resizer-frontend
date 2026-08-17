import { Alert, Image, Tag, Typography } from 'antd';
import { PictureOutlined, ThunderboltFilled } from '@ant-design/icons';
import ResultsGrid, { PendingResultsGrid } from './ResultsGrid';
import { GeneratedResult, TargetSize } from '../types';
import { sizeKey } from './SizePicker';
import { assetUrl } from '../api/client';
import { parseServerDate } from '../utils/date';

function formatTime(value?: string): string {
  if (!value) return '';
  const date = parseServerDate(value);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface RequestBubbleProps {
  originalUrl: string;
  originalWidth?: number | null;
  originalHeight?: number | null;
  description: string;
  sizes: TargetSize[];
  createdAt?: string;
}

function RequestBubble({
  originalUrl,
  originalWidth,
  originalHeight,
  description,
  sizes,
  createdAt,
}: RequestBubbleProps) {
  return (
    <div className="msg msg-user">
      <div className="msg-bubble">
        <div className="msg-bubble-head">
          <PictureOutlined style={{ color: '#7aa2ff' }} />
          <Typography.Text strong style={{ fontSize: 13 }}>
            Original
          </Typography.Text>
          {originalWidth && originalHeight && (
            <Typography.Text type="secondary" style={{ fontSize: 12.5 }}>
              {originalWidth} × {originalHeight}
            </Typography.Text>
          )}
          {createdAt && (
            <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
              {formatTime(createdAt)}
            </Typography.Text>
          )}
        </div>

        <div className="msg-thumb-frame">
          <Image
            src={assetUrl(originalUrl)}
            alt="Uploaded banner"
            preview={{ mask: 'Preview' }}
          />
        </div>

        {description.trim() && (
          <Typography.Paragraph style={{ margin: '12px 0 0', whiteSpace: 'pre-wrap' }}>
            {description}
          </Typography.Paragraph>
        )}

        <div style={{ marginTop: 12 }}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>
            Targeted
          </Typography.Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {sizes.map((size) => (
              <Tag key={sizeKey(size)} bordered={false} className="size-tag">
                {size.width} × {size.height}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface GenerationBlockProps extends RequestBubbleProps {
  results?: GeneratedResult[];
  pending?: boolean;
}

export default function GenerationBlock({ results, pending, ...request }: GenerationBlockProps) {
  return (
    <section className="generation-block">
      <RequestBubble {...request} />

      <div className="msg msg-ai">
        <span className="ai-avatar">
          <ThunderboltFilled />
        </span>
        <div className="msg-ai-body">
          {pending && (
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
              Adapting {request.sizes.length} size{request.sizes.length === 1 ? '' : 's'}…
            </Typography.Text>
          )}
          {pending ? (
            <PendingResultsGrid sizes={request.sizes} />
          ) : (results?.length ?? 0) === 0 ? (
            <Alert
              type="warning"
              showIcon
              message="This generation was interrupted before any banner was saved."
              style={{ borderRadius: 10 }}
            />
          ) : (
            <ResultsGrid results={results ?? []} />
          )}
        </div>
      </div>
    </section>
  );
}
