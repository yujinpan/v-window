import type { DraggableOptions } from './utils';

import {
  draggable,
  getTarget,
  getTranslateCoordinate,
  setTranslate,
} from './utils';

export type MovableOptions = {
  headerSelector?: string;
  getStartState?: (el: HTMLElement) => { x: number; y: number };
  setMoveState?: (el: HTMLElement, state: { x: number; y: number }) => void;
} & DraggableOptions;

export function movable(
  el: HTMLElement,
  {
    headerSelector,
    canStart,
    onStart,
    onEnd,
    getPointerBounds,
    getStartState = (el) => {
      const [x, y] = getTranslateCoordinate(el);
      return { x, y };
    },
    setMoveState = (el, { x, y }) => setTranslate(el, x, y),
    boundsTarget,
  }: MovableOptions = {},
) {
  const target = getTarget(el, headerSelector);
  let initX: number;
  let initY: number;
  return draggable(target, {
    canStart: canStart,
    onStart: (e) => {
      const { x, y } = getStartState(el);
      initX = x;
      initY = y;
      onStart && onStart(e);
    },
    onMove: (x, y) => {
      setMoveState(el, { x: x + initX, y: y + initY });
    },
    onEnd,
    getPointerBounds,
    boundsTarget: boundsTarget || el,
  });
}
