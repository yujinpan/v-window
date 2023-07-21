import type { Fn } from '../../types';

import {
  draggable,
  getTranslateCoordinate,
  isPositionBottom,
  isPositionRight,
  setTranslate,
  throttle,
} from './utils';

export function resizeable(
  el: HTMLElement,
  {
    canResize,
    onHover,
    onBlur,
    onStart,
    onEnd,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  }: {
    canResize?: () => boolean;
    onHover?: Fn;
    onBlur?: Fn;
    onStart?: Fn;
    onEnd?: Fn;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {},
) {
  const unbinds = [];
  let dragging = false;
  let currentDirection: Direction | undefined;

  // 4条边，4个点的鼠标滑过事件
  const mousemoveListener = throttle((e: MouseEvent) => {
    if (dragging) return;
    const range = getElementRange(el);
    const direction = getDirectionByRange(e, range);
    if (direction !== currentDirection) {
      currentDirection = direction;
      const cursor = getCursor(direction);
      document.body.style.cursor = cursor;
      el.style.cursor = cursor;
      if (direction) {
        onHover && onHover();
      } else {
        onBlur && onBlur();
      }
    }
  }, 50);
  document.addEventListener('mousemove', mousemoveListener);
  unbinds.push(() =>
    document.removeEventListener('mousemove', mousemoveListener),
  );

  // 在4条边，4个点上的拖动事件
  let dragDirection: Direction | undefined;
  let initX: number;
  let initY: number;
  let initWidth: number;
  let initHeight: number;
  let initLeft: string;
  let initTop: string;
  minWidth = minWidth || 34;
  minHeight = minHeight || 20;
  const unbindDraggable = draggable(document, {
    canDrag: () => !!currentDirection && (canResize ? canResize() : true),
    onStart: () => {
      const [x, y] = getTranslateCoordinate(el);
      const { width, height } = el.getBoundingClientRect();
      const { left, top } = getComputedStyle(el);
      initX = x;
      initY = y;
      initWidth = width;
      initHeight = height;
      initLeft = left;
      initTop = top;
      dragDirection = currentDirection;
      dragging = true;
      onStart && onStart();
    },
    onMove: (x, y) => {
      let height: number = initHeight;
      let width: number = initWidth;
      let translateX: number = initX;
      let translateY: number = initY;
      switch (dragDirection) {
        case 'top':
          height = initHeight - y;
          if (!isPositionBottom(el, initTop)) {
            translateY = initY + y;
          }
          break;
        case 'right':
          width = initWidth + x;
          if (isPositionRight(el, initLeft)) {
            translateX = initX + x;
          }
          break;
        case 'bottom':
          height = initHeight + y;
          if (isPositionBottom(el, initTop)) {
            translateY = initY + y;
          }
          break;
        case 'left':
          width = initWidth - x;
          if (!isPositionRight(el, initLeft)) {
            translateX = initX + x;
          }
          break;
        case 'topLeft':
          width = initWidth - x;
          height = initHeight - y;
          if (!isPositionRight(el, initLeft)) {
            translateX = initX + x;
          }
          if (!isPositionBottom(el, initTop)) {
            translateY = initY + y;
          }
          break;
        case 'topRight':
          width = initWidth + x;
          height = initHeight - y;
          if (!isPositionBottom(el, initTop)) {
            translateY = initY + y;
          }
          if (isPositionRight(el, initLeft)) {
            translateX = initX + x;
          }
          break;
        case 'bottomRight':
          width = initWidth + x;
          height = initHeight + y;
          if (isPositionRight(el, initLeft)) {
            translateX = initX + x;
          }
          if (isPositionBottom(el, initTop)) {
            translateY = initY + y;
          }
          break;
        case 'bottomLeft':
          width = initWidth - x;
          height = initHeight + y;
          if (!isPositionBottom(el, initTop)) {
            translateX = initX + x;
          } else {
            translateY = initY + y;
          }
          break;
      }

      // size limit
      if (minWidth && width < minWidth) {
        if (translateX !== initX) translateX = translateX - (minWidth - width);
        width = minWidth;
      }
      if (minHeight && height < minHeight) {
        if (translateY !== initY)
          translateY = translateY - (minHeight - height);
        height = minHeight;
      }
      if (maxWidth && width > maxWidth) {
        if (translateX !== initX) translateX = translateX + (width - maxWidth);
        width = maxWidth;
      }
      if (maxHeight && height > maxHeight) {
        if (translateY !== initY)
          translateY = translateY + (height - maxHeight);
        height = maxHeight;
      }

      el.style.width = width + 'px';
      el.style.height = height + 'px';
      setTranslate(el, translateX, translateY);
    },
    onEnd: () => {
      dragging = false;
      onEnd && onEnd();
    },
  });
  unbinds.push(unbindDraggable);

  // 绑定移除事件，在 unbind 阶段移除
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  el.__resizeable__ = unbinds;
}

export function unResizeable(el: HTMLElement) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (el.__resizeable__) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    el.__resizeable__.forEach((item) => item());
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete el.__resizeable__;
  }
}

type Direction =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'topLeft'
  | 'topRight'
  | 'bottomRight'
  | 'bottomLeft';

function getElementRange(el: HTMLElement): { [p in Direction]: number[] } {
  const { top, left, right, bottom } = el.getBoundingClientRect();
  const buffer = 5;
  const topMin = top - buffer;
  const topMax = top + buffer;
  const leftMin = left - buffer;
  const leftMax = left + buffer;
  const rightMin = right - buffer;
  const rightMax = right + buffer;
  const bottomMin = bottom - buffer;
  const bottomMax = bottom + buffer;

  return {
    // angle
    topLeft: [leftMin, topMin, leftMax, topMax],
    topRight: [rightMin, topMin, rightMax, topMax],
    bottomRight: [rightMin, bottomMin, rightMax, bottomMax],
    bottomLeft: [leftMin, bottomMin, leftMax, bottomMax],
    // edge
    top: [leftMax, topMin, rightMin, topMax],
    right: [rightMin, topMax, rightMax, bottomMin],
    bottom: [leftMax, bottomMin, rightMin, bottomMax],
    left: [leftMin, topMax, leftMax, bottomMin],
  };
}

function getDirectionByRange(
  { x, y }: { x: number; y: number },
  range: { [p in Direction]: number[] },
): Direction | undefined {
  let findDirection: Direction | undefined;
  let key: Direction;
  for (key in range) {
    const [xMin, yMin, xMax, yMax] = range[key];
    if (x > xMin && x < xMax && y > yMin && y < yMax) {
      findDirection = key;
      break;
    }
  }
  return findDirection;
}

function getCursor(direction: Direction | undefined): string {
  switch (direction) {
    case 'topLeft':
    case 'bottomRight':
      return 'nwse-resize';
    case 'top':
    case 'bottom':
      return 'ns-resize';
    case 'bottomLeft':
    case 'topRight':
      return 'nesw-resize';
    case 'left':
    case 'right':
      return 'ew-resize';
    default:
      return '';
  }
}
