import { CSSProperties, useState } from 'react';
import { Alert, App as AntApp, Button, Card, Image, Spin, Tag, Tooltip, Typography } from 'antd';
import { DownloadOutlined, Loading3QuartersOutlined } from '@ant-design/icons';
import { GeneratedResult, ImageProviderName, TargetSize } from '../types';
import { providerColor, providerLabel } from '../providers';
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

/** Colour-coded attribution so mixed grids can be scanned at a glance. */
function ProviderBadge({ result }: { result: GeneratedResult }) {
  const hint = [
    result.model && `Model: ${result.model}`,
    result.renderedAs && `Rendered at ${result.renderedAs}, cropped to ${result.width}×${result.height}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const badge = (
    <span
      className="provider-badge"
      style={{ '--provider-color': providerColor(result.provider) } as CSSProperties}
    >
      <span className="provider-dot" />
      {providerLabel(result.provider)}
    </span>
  );

  return hint ? <Tooltip title={hint}>{badge}</Tooltip> : badge;
}

interface ResultCardProps {
  result: GeneratedResult;
  /** Hidden when the size is already shown by the comparison row header. */
  showSize: boolean;
  downloading: boolean;
  onDownload: (result: GeneratedResult) => void;
}

function ResultCard({ result, showSize, downloading, onDownload }: ResultCardProps) {
  return (
    <Card
      className="glass-card result-card fade-in"
      style={result.status === 'done' ? cardStyle(result.width, result.height) : { width: 300, maxWidth: '100%' }}
      styles={{ body: { padding: 12 } }}
    >
      <div className="result-card-head">
        <ProviderBadge result={result} />
        {result.status === 'error' ? (
          <Tag color="error" style={{ marginInlineEnd: 0 }}>
            Failed
          </Tag>
        ) : (
          showSize && (
            <Typography.Text strong style={{ fontSize: 13 }}>
              {result.width} × {result.height}
            </Typography.Text>
          )
        )}
      </div>

      {result.status === 'done' && result.url ? (
        <>
          <div className="result-image-frame" style={frameStyle}>
            <Image
              src={assetUrl(result.url)}
              alt={`${providerLabel(result.provider)} adaptation, ${result.width}x${result.height}`}
              preview={{ mask: 'Preview' }}
            />
          </div>
          <Button
            icon={<DownloadOutlined />}
            block
            size="small"
            loading={downloading}
            onClick={() => onDownload(result)}
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
  );
}

export function PendingResultsGrid({
  sizes,
  providers,
}: {
  sizes: TargetSize[];
  providers: ImageProviderName[];
}) {
  const lanes = providers.length > 0 ? providers : (['gemini'] as ImageProviderName[]);
  return (
    <div className="results-grid">
      {sizes.flatMap((size) =>
        lanes.map((provider) => (
          <Card
            key={`${sizeKey(size)}-${provider}`}
            className="glass-card result-card"
            style={cardStyle(size.width, size.height)}
            styles={{ body: { padding: 12 } }}
          >
            <div className="result-image-frame" style={frameStyle}>
              <Spin indicator={<Loading3QuartersOutlined spin style={{ fontSize: 26, color: '#7aa2ff' }} />} />
            </div>
            <div className="result-card-head" style={{ marginBottom: 0 }}>
              <span
                className="provider-badge"
                style={{ '--provider-color': providerColor(provider) } as CSSProperties}
              >
                <span className="provider-dot" />
                {providerLabel(provider)}
              </span>
              <Typography.Text type="secondary" style={{ fontSize: 12.5 }}>
                {size.width} × {size.height}
              </Typography.Text>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

/** Groups results by target size, preserving the order sizes first appear in. */
function groupBySize(results: GeneratedResult[]): Array<{ size: TargetSize; results: GeneratedResult[] }> {
  const groups = new Map<string, { size: TargetSize; results: GeneratedResult[] }>();
  for (const result of results) {
    const key = `${result.width}x${result.height}`;
    const group = groups.get(key);
    if (group) group.results.push(result);
    else groups.set(key, { size: { width: result.width, height: result.height }, results: [result] });
  }
  return [...groups.values()];
}

export default function ResultsGrid({ results }: { results: GeneratedResult[] }) {
  const { message } = AntApp.useApp();
  const [downloading, setDownloading] = useState<string | null>(null);

  if (results.length === 0) return null;

  const handleDownload = async (result: GeneratedResult) => {
    if (!result.url) return;
    setDownloading(result.id);
    try {
      await downloadImage(
        assetUrl(result.url),
        `banner_${result.provider}_${result.width}x${result.height}.png`
      );
    } catch {
      message.error('Could not download the image. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  // With a single model the flat justified gallery is enough. With several,
  // group each size's variants into their own row so the models sit directly
  // next to each other — that side-by-side pairing is the whole point.
  const comparing = new Set(results.map((result) => result.provider)).size > 1;

  if (!comparing) {
    return (
      <div className="results-grid">
        {results.map((result) => (
          <ResultCard
            key={result.id}
            result={result}
            showSize
            downloading={downloading === result.id}
            onDownload={handleDownload}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="results-comparison">
      {groupBySize(results).map((group) => (
        <div className="comparison-row" key={sizeKey(group.size)}>
          <div className="comparison-row-head">
            <Typography.Text strong style={{ fontSize: 13 }}>
              {group.size.width} × {group.size.height}
            </Typography.Text>
            <span className="comparison-rule" />
          </div>
          <div className="results-grid">
            {group.results.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                showSize={false}
                downloading={downloading === result.id}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
