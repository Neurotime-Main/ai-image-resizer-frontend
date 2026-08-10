import { useState } from 'react';
import { Alert, App as AntApp, Button, Card, Image, Spin, Tag, Typography } from 'antd';
import { DownloadOutlined, Loading3QuartersOutlined } from '@ant-design/icons';
import { GeneratedResult, TargetSize } from '../types';
import { sizeKey } from './SizePicker';
import { assetUrl } from '../api/client';

async function downloadImage(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Download failed');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

/**
 * Justified-gallery sizing: every preview is the same height, so cards line up
 * in tidy rows, while each card's width follows its format's real proportions
 * and the row wraps when it runs out of space. The clamp stops a leaderboard
 * from spanning the whole row and a 9:16 story from becoming a sliver.
 */
const PREVIEW_HEIGHT = 148;
const MIN_PREVIEW_WIDTH = 116;
const MAX_PREVIEW_WIDTH = 360;
const CARD_PADDING = 24; // antd Card body padding, both sides

function previewWidth(width: number, height: number): number {
  const ideal = Math.round(PREVIEW_HEIGHT * (width / height));
  return Math.min(MAX_PREVIEW_WIDTH, Math.max(MIN_PREVIEW_WIDTH, ideal));
}

function cardStyle(width: number, height: number) {
  return { width: previewWidth(width, height) + CARD_PADDING, maxWidth: '100%' };
}

const frameStyle = { height: PREVIEW_HEIGHT };

export function PendingResultsGrid({ sizes }: { sizes: TargetSize[] }) {
  return (
    <div className="results-grid">
      {sizes.map((size) => (
        <Card
          key={sizeKey(size)}
          className="glass-card result-card"
          style={cardStyle(size.width, size.height)}
          styles={{ body: { padding: 12 } }}
        >
          <div className="result-image-frame" style={frameStyle}>
            <Spin indicator={<Loading3QuartersOutlined spin style={{ fontSize: 26, color: '#7aa2ff' }} />} />
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 12.5 }}>
            {size.width} × {size.height}
          </Typography.Text>
        </Card>
      ))}
    </div>
  );
}

export default function ResultsGrid({ results }: { results: GeneratedResult[] }) {
  const { message } = AntApp.useApp();
  const [downloading, setDownloading] = useState<string | null>(null);

  if (results.length === 0) return null;

  const handleDownload = async (result: GeneratedResult) => {
    if (!result.url) return;
    setDownloading(result.id);
    try {
      await downloadImage(assetUrl(result.url), `banner_${result.width}x${result.height}.png`);
    } catch {
      message.error('Could not download the image. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="results-grid">
      {results.map((result) => (
        <Card
          key={result.id}
          className="glass-card result-card fade-in"
          style={result.status === 'done' ? cardStyle(result.width, result.height) : { width: 300, maxWidth: '100%' }}
          styles={{ body: { padding: 12 } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Typography.Text strong style={{ fontSize: 13 }}>
              {result.width} × {result.height}
            </Typography.Text>
            {result.status === 'error' && <Tag color="error">Failed</Tag>}
          </div>

          {result.status === 'done' && result.url ? (
            <>
              <div className="result-image-frame" style={frameStyle}>
                <Image
                  src={assetUrl(result.url)}
                  alt={`Adapted banner ${result.width}x${result.height}`}
                  preview={{ mask: 'Preview' }}
                />
              </div>
              <Button
                icon={<DownloadOutlined />}
                block
                size="small"
                loading={downloading === result.id}
                onClick={() => handleDownload(result)}
              >
                Download
              </Button>
            </>
          ) : (
            <Alert
              type="error"
              showIcon
              message="Generation failed"
              description={result.error || 'Unknown error.'}
              style={{ borderRadius: 10 }}
            />
          )}
        </Card>
      ))}
    </div>
  );
}
