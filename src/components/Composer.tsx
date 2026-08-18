import { useEffect, useRef, useState } from 'react';
import { App as AntApp, Button, Input, Tag, Tooltip, Typography, Upload } from 'antd';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  ExpandAltOutlined,
  SwapOutlined,
  StopOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import SizePicker, { MAX_SELECTED_SIZES } from './SizePicker';
import { TargetSize } from '../types';
import { assetUrl } from '../api/client';

const { Dragger } = Upload;

/** Keep in sync with MAX_UPLOAD_MB in backend/src/middlewares/upload.middleware.ts. */
const MAX_UPLOAD_MB = 100;
const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/avif';
const SUPPORTED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif',
]);

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export interface ComposerSubmit {
  file: File | null;
  description: string;
  sizes: TargetSize[];
}

interface ComposerProps {
  /** Banner already attached to this chat — lets the user generate more sizes without re-uploading. */
  existingBannerUrl?: string | null;
  generating: boolean;
  onSubmit: (input: ComposerSubmit) => void;
  onStop: () => void;
}

export default function Composer({ existingBannerUrl, generating, onSubmit, onStop }: ComposerProps) {
  const { message } = AntApp.useApp();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<TargetSize[]>([]);
  const replacementInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // A different chat was opened — drop any staged upload.
  useEffect(() => {
    setFile(null);
    setPreviewUrl(null);
    setSelectedSizes([]);
    if (replacementInputRef.current) replacementInputRef.current.value = '';
  }, [existingBannerUrl]);

  const acceptFile = (nextFile: File): boolean => {
    if (!SUPPORTED_IMAGE_TYPES.has(nextFile.type)) {
      message.error('Please upload a PNG, JPEG, WebP, GIF, or AVIF image.');
      return false;
    }
    if (nextFile.size > MAX_UPLOAD_MB * 1024 * 1024) {
      message.error(`The image must be smaller than ${MAX_UPLOAD_MB} MB.`);
      return false;
    }
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    if (replacementInputRef.current) replacementInputRef.current.value = '';
    return false; // handled manually on submit
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const hasBanner = Boolean(file) || Boolean(existingBannerUrl);
  const canSubmit = hasBanner && selectedSizes.length > 0 && !generating;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({ file, description, sizes: selectedSizes });
    setDescription('');
    setSelectedSizes([]);
  };

  const showUploader = !file && !existingBannerUrl;

  return (
    <div className="composer">
      {showUploader ? (
        <div className="upload-dragger">
          <Dragger
            accept={IMAGE_ACCEPT}
            multiple={false}
            fileList={[]}
            beforeUpload={acceptFile}
            showUploadList={false}
          >
            <div className="upload-inline">
              <CloudUploadOutlined style={{ fontSize: 20, color: '#5d87ff' }} />
              <Typography.Text style={{ fontSize: 13.5 }}>
                Drop your banner here or <span style={{ color: '#7ba0ff' }}>browse</span>
              </Typography.Text>
            </div>
          </Dragger>
        </div>
      ) : (
        <div className="composer-banner">
          <div className="composer-thumb">
            <img src={file ? previewUrl! : assetUrl(existingBannerUrl!)} alt="Selected banner" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography.Text strong style={{ display: 'block', wordBreak: 'break-all' }}>
              {file ? file.name : 'Current banner'}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12.5 }}>
              {file ? formatFileSize(file.size) : 'Reused for new sizes'}
            </Typography.Text>
          </div>
          {file ? (
            <Tooltip title="Remove">
              <Button icon={<DeleteOutlined />} onClick={clearFile} disabled={generating} danger ghost size="small" />
            </Tooltip>
          ) : (
            <Button
              icon={<SwapOutlined />}
              size="small"
              onClick={() => replacementInputRef.current?.click()}
              disabled={generating}
            >
              Change
            </Button>
          )}
        </div>
      )}

      <input
        ref={replacementInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        hidden
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (selected) acceptFile(selected);
          else event.target.value = '';
        }}
      />

      <Input.TextArea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder='Optional instructions… e.g. "Make the product slightly more prominent."'
        autoSize={{ minRows: 1, maxRows: 4 }}
        maxLength={500}
        disabled={generating}
        style={{ marginTop: 10 }}
      />

      <div className="sizes-head">
        <ExpandAltOutlined style={{ color: '#7aa2ff' }} />
        <span style={{ fontWeight: 600, fontSize: 13 }}>Target sizes</span>
        {selectedSizes.length > 0 && (
          <Tag color="blue" bordered={false}>
            {selectedSizes.length}/{MAX_SELECTED_SIZES}
          </Tag>
        )}
      </div>
      <SizePicker selected={selectedSizes} onChange={setSelectedSizes} disabled={generating} />

      <div className="composer-footer">
        {generating ? (
          <Button danger type="primary" size="large" icon={<StopOutlined />} onClick={onStop}>
            Stop
          </Button>
        ) : (
          <Button
            className="gradient-btn"
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            disabled={!canSubmit}
            onClick={submit}
          >
            Generate
          </Button>
        )}
      </div>
    </div>
  );
}
