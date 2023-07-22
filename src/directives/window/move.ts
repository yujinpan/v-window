import type { DraggableOptions } from './utils';

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
    getPointerBounds,
  }: {
    headerSelector?: string;
    canMove?: () => boolean;
  } & Partial<
    Pick<
      DraggableOptions,
      'canStart' | 'onStart' | 'onEnd' | 'getPointerBounds'
    >
  > = {},
) {
  const target = getTarget(el, headerSelector);
  let initX: number;
  let initY: number;
  draggable(target, {
    canStart: canMove,
    onStart: (e) => {
      const [x, y] = getTranslateCoordinate(el);
      initX = x;
      initY = y;
      onStart && onStart(e);
    },
    onMove: (x, y) => {
      setTranslate(el, x + initX, y + initY);
    },
    onEnd,
    getPointerBounds,
  });
}
