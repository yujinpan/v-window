import type { Fn } from '../../types';

import {
  draggable,
  getTarget,
  getTranslateCoordinate,
  setTranslate,
} from './utils';

export function movable(
  el: HTMLElement,
  {
    headerSelector,
    canMove,
    onStart,
    onEnd,
  }: {
    headerSelector?: string;
    canMove?: () => boolean;
    onStart?: Fn;
    onEnd?: Fn;
  } = {},
) {
  const target = getTarget(el, headerSelector);
  let initX: number;
  let initY: number;
  draggable(target, {
    canStart: canMove,
    onStart: () => {
      const [x, y] = getTranslateCoordinate(el);
      initX = x;
      initY = y;
      onStart && onStart();
    },
    onMove: (x, y) => {
      setTranslate(el, x + initX, y + initY);
    },
    onEnd,
  });
}
