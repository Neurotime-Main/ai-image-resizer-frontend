import { useState } from 'react';
import { Button, InputNumber, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { TargetSize } from '../types';

export const PRESET_SIZES: Array<TargetSize & { label: string }> = [
  { width: 230, height: 80, label: 'Small banner' },
  { width: 100, height: 100, label: 'Square icon' },
  { width: 300, height: 250, label: 'Medium rectangle' },
  { width: 728, height: 90, label: 'Leaderboard' },
  { width: 1200, height: 628, label: 'Social link post' },
  { width: 1080, height: 1080, label: 'Square post' },
  { width: 1080, height: 1350, label: 'Portrait post' },
  { width: 1080, height: 1920, label: 'Story / Reels' },
];

const MIN_DIMENSION = 16;
const MAX_DIMENSION = 4096;
export const MAX_SELECTED_SIZES = 8;

export function sizeKey(size: TargetSize): string {
  return `${size.width}x${size.height}`;
}

/** Miniature rectangle proportional to the size's aspect ratio. */
function RatioThumb({ width, height }: TargetSize) {
  const maxSide = 18;
  const scale = maxSide / Math.max(width, height);
  const w = Math.max(6, Math.round(width * scale));
  const h = Math.max(6, Math.round(height * scale));
  return (
    <span style={{ width: 20, display: 'inline-flex', justifyContent: 'center', flexShrink: 0 }}>
      <span className="ratio-thumb" style={{ width: w, height: h }} />
    </span>
  );
}

interface SizePickerProps {
  selected: TargetSize[];
  onChange: (sizes: TargetSize[]) => void;
  disabled?: boolean;
}

export default function SizePicker({ selected, onChange, disabled }: SizePickerProps) {
  const [customSizes, setCustomSizes] = useState<TargetSize[]>([]);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);

  const selectedKeys = new Set(selected.map(sizeKey));
  const atLimit = selected.length >= MAX_SELECTED_SIZES;

  const toggle = (size: TargetSize) => {
    if (disabled) return;
    if (selectedKeys.has(sizeKey(size))) {
      onChange(selected.filter((s) => sizeKey(s) !== sizeKey(size)));
    } else if (!atLimit) {
      onChange([...selected, { width: size.width, height: size.height }]);
    }
  };

  const addCustom = () => {
    if (!customWidth || !customHeight) return;
    const size: TargetSize = { width: Math.round(customWidth), height: Math.round(customHeight) };
    const key = sizeKey(size);
    const isPreset = PRESET_SIZES.some((p) => sizeKey(p) === key);
    if (!isPreset && !customSizes.some((c) => sizeKey(c) === key)) {
      setCustomSizes([...customSizes, size]);
    }
    if (!selectedKeys.has(key) && !atLimit) {
      onChange([...selected, size]);
    }
    setCustomWidth(null);
    setCustomHeight(null);
  };

  const removeCustom = (size: TargetSize) => {
    setCustomSizes(customSizes.filter((c) => sizeKey(c) !== sizeKey(size)));
    onChange(selected.filter((s) => sizeKey(s) !== sizeKey(size)));
  };

  const renderChip = (size: TargetSize, label: string, custom = false) => {
    const isSelected = selectedKeys.has(sizeKey(size));
    return (
      <Tooltip title={label} key={sizeKey(size)} mouseEnterDelay={0.4}>
        <button
          type="button"
          className={`size-chip${isSelected ? ' selected' : ''}`}
          onClick={() => toggle(size)}
          disabled={disabled}
        >
          <RatioThumb width={size.width} height={size.height} />
          <span className="size-chip-dims">
            {size.width} × {size.height}
          </span>
          {isSelected && <CheckOutlined className="chip-check" />}
          {custom && (
            <span
              className="chip-remove"
              role="button"
              aria-label="Remove custom size"
              onClick={(event) => {
                event.stopPropagation();
                removeCustom(size);
              }}
            >
              <CloseOutlined />
            </span>
          )}
        </button>
      </Tooltip>
    );
  };

  return (
    <div>
      <div className="size-row">
        {PRESET_SIZES.map((preset) => renderChip(preset, preset.label))}
        {customSizes.map((size) => renderChip(size, 'Custom size', true))}
      </div>

      <div className="custom-size-row">
        <InputNumber
          size="small"
          placeholder="Width"
          min={MIN_DIMENSION}
          max={MAX_DIMENSION}
          value={customWidth}
          onChange={setCustomWidth}
          disabled={disabled}
          style={{ width: 92 }}
        />
        <span style={{ color: '#6e81ad' }}>×</span>
        <InputNumber
          size="small"
          placeholder="Height"
          min={MIN_DIMENSION}
          max={MAX_DIMENSION}
          value={customHeight}
          onChange={setCustomHeight}
          disabled={disabled}
          style={{ width: 92 }}
        />
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={addCustom}
          disabled={disabled || !customWidth || !customHeight}
        >
          Custom size
        </Button>
      </div>
    </div>
  );
}
