import { theme, ThemeConfig } from 'antd';

export const appTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#4e7cff',
    colorInfo: '#4e7cff',
    colorLink: '#7ba0ff',
    colorBgBase: '#0a1020',
    colorBgContainer: '#101a33',
    colorBgElevated: '#15203d',
    colorBgLayout: '#070b16',
    colorBorder: '#243356',
    colorBorderSecondary: '#1b2947',
    colorText: '#e6ecff',
    colorTextSecondary: '#9fb0d8',
    borderRadius: 12,
    fontSize: 14,
    fontFamily:
      "'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Button: {
      fontWeight: 600,
      controlHeight: 40,
      controlHeightLG: 48,
    },
    Card: {
      colorBgContainer: 'rgba(16, 26, 51, 0.75)',
    },
    Input: {
      controlHeight: 42,
    },
    InputNumber: {
      controlHeight: 42,
    },
  },
};
