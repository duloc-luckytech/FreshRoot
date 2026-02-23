// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'plus.slash.minus.equal': 'calculate',
  'mappin.and.ellipse': 'local-offer',
  'person.3.fill': 'groups',
  'rectangle.portrait.and.arrow.right': 'logout',
  magnifyingglass: 'search',
  'star.fill': 'star',
  'checkmark.seal.fill': 'verified',
  'chevron.left': 'chevron-left',
  'local-offer': 'local-offer',
  'plus': 'add',
  'minus': 'remove',
  'cart.badge.minus': 'remove-shopping-cart',
  'xmark.circle.fill': 'cancel',
  'person.fill': 'person',
  'shield.fill': 'shield',
  'location.fill': 'location-on',
  'phone.fill': 'phone',
  'lock.fill': 'lock',
  'bell.fill': 'notifications',
  'info.circle.fill': 'info',
  'trash.fill': 'delete',
  'clock.fill': 'history',
  'list.bullet': 'format-list-bulleted',
  'checkmark.circle.fill': 'check-circle',
  'bag.fill': 'shopping-bag',
  'exclamationmark.triangle.fill': 'warning',
  'eye.fill': 'remove-red-eye',
  'tag.fill': 'local-offer',
  'sparkles': 'auto-awesome',
  'faceid': 'face',
  'fingerprint': 'fingerprint',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
