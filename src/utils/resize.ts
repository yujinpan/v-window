import type { DraggableOptions } from './utils';
import type { Fn } from '../types';

import {
  draggable,
  getTranslateCoordinate,
  isPositionBottom,
  isPositionRight,
  limitAddVal,
  setTranslate,
  throttle,
} from './utils';

export type ResizeableOptions = {
  onHover?: Fn;
  onBlur?: Fn;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  getStartState?: (el: HTMLElement) => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  setMoveState?: (
    el: HTMLElement,
    state: { x: number; y: number; width: number; height: number },
  ) => void;
} & DraggableOptions;

export function resizeable(
  el: HTMLElement,
  {
    canStart,
    onHover,
    onBlur,
    onStart,
    onEnd,
    getPointerBounds,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    getStartState = (el) => {
      const [x, y] = getTranslateCoordinate(el);
      const { width, height } = el.getBoundingClientRect();
      return { x, y, width, height };
    },
    setMoveState = (el, { width, height, x, y }) => {
      el.style.width = width + 'px';
      el.style.height = height + 'px';
      setTranslate(el, x, y);
    },
  }: ResizeableOptions = {},
) {
  const unbinds = [];
  let dragging = false;
  let currentDirection: Direction | undefined;

  // 4条边，4个点的鼠标滑过事件
  const mousemoveListener = throttle((e: MouseEvent) => {
    if (dragging) {
      return;
    } else if (canStart ? !canStart(e) : false) {
      document.body.style.cursor = '';
      el.style.cursor = '';
      return;
    }

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
  minWidth = minWidth || 34;
  minHeight = minHeight || 20;
  const unbindDraggable = draggable(document, {
    canStart: (e) => !!currentDirection && (canStart ? canStart(e) : true),
    onStart: (e) => {
      const startState = getStartState(el);
      const { x, y } = startState;
      let { width, height } = startState;
      if (!width || !height) {
        const rect = el.getBoundingClientRect();
        width = width || rect.width;
        height = height || rect.height;
      }
      initX = x;
      initY = y;
      initWidth = width;
      initHeight = height;
      dragDirection = currentDirection;
      dragging = true;
      onStart && onStart(e);
    },
    onMove: (x, y) => {
      let height: number = initHeight;
      let width: number = initWidth;
      let translateX: number = initX;
      let translateY: number = initY;

      const limitAddX = (x: number) => {
        return limitAddVal(width, x, minWidth, maxWidth);
      };
      const limitAddY = (y: number) => {
        return limitAddVal(height, y, minHeight, maxHeight);
      };

      const setTop = () => {
        // to top is add, to bottom is reduce
        y = limitAddY(-y);
        height = initHeight + y;
        if (!isPositionBottom(el)) {
          translateY = initY - y;
        }
      };
      const setBottom = () => {
        // to top is reduce, to bottom is add
        y = limitAddY(y);
        height = initHeight + y;
        if (isPositionBottom(el)) {
          translateY = initY + y;
        }
      };
      const setLeft = () => {
        // to left is add, to right is reduce
        x = limitAddX(-x);
        width = initWidth + x;
        if (!isPositionRight(el)) {
          translateX = initX - x;
        }
      };
      const setRight = () => {
        // to left is reduce, to right is add
        x = limitAddX(x);
        width = initWidth + x;
        if (isPositionRight(el)) {
          translateX = initX + x;
        }
      };

      switch (dragDirection) {
        case 'top':
          setTop();
          break;
        case 'right':
          setRight();
          break;
        case 'bottom':
          setBottom();
          break;
        case 'left':
          setLeft();
          break;
        case 'topLeft':
          setTop();
          setLeft();
          break;
        case 'topRight':
          setTop();
          setRight();
          break;
        case 'bottomRight':
          setBottom();
          setRight();
          break;
        case 'bottomLeft':
          setBottom();
          setLeft();
          break;
      }

      setMoveState(el, {
        x: translateX,
        y: translateY,
        width,
        height,
      });
    },
    onEnd: (e) => {
      dragging = false;
      onEnd && onEnd(e);
    },
    getPointerBounds: (e) => {
      const { top, right, bottom, left } = getPointerBounds?.(e) || {};
      const direction = dragDirection?.toLowerCase() || '';
      return {
        top: direction.includes('bottom') ? undefined : top,
        bottom: direction.includes('top') ? undefined : bottom,
        left: direction.includes('right') ? undefined : left,
        right: direction.includes('left') ? undefined : right,
      };
    },
    boundsTarget: el,
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
