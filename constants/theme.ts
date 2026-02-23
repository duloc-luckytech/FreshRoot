/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#E67E22'; // Deep Orange
const tintColorDark = '#F39C12'; // Sunny Orange

export const Colors = {
  light: {
    text: '#2C3E50',
    background: '#FDFEFE',
    tint: tintColorLight,
    icon: '#7F8C8D',
    tabIconDefault: '#BDC3C7',
    tabIconSelected: tintColorLight,
    success: '#27AE60',
    warning: '#F1C40F',
    danger: '#E74C3C',
    info: '#3498DB',
  },
  dark: {
    text: '#ECF0F1',
    background: '#1A1A1A',
    tint: tintColorDark,
    icon: '#95A5A6',
    tabIconDefault: '#34495E',
    tabIconSelected: tintColorDark,
    success: '#2ECC71',
    warning: '#F39C12',
    danger: '#E74C3C',
    info: '#3498DB',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
