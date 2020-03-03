import {
  NativeTestInstance,
  RenderOptions,
  RenderResult,
} from '@testing-library/react-native';
import { ReactElement } from 'react';

export function findFocused(container: NativeTestInstance): NativeTestInstance;
export function render(
  ui: ReactElement<any>,
  options?: Omit<RenderOptions, 'queries'>
): RenderResult;
