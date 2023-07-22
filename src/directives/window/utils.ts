import type { Fn, Obj } from '@/types';

export function throttle(fn: Fn & { __throttle__?: any }, time = 0) {
  let lastArgs: any;
  return function (...args: any[]) {
    if (!fn.__throttle__) {
      fn.__throttle__ = setTimeout(() => {
        fn(...args);
        fn.__throttle__ = null;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, time);
    } else {
      lastArgs = args;
    }
  };
}

export function getTarget(el: HTMLElement, selector?: string): HTMLElement {
  return selector ? el.querySelector(selector) || el : el;
}

export type Bounds = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type DraggableOptions = {
  canStart?: (e: MouseEvent) => boolean;
  onStart: (e: MouseEvent) => any;
  onMove: (x: number, y: number) => void;
  onEnd?: (e: MouseEvent) => any;
  getPointerBounds?: (e: MouseEvent) => Bounds;
};

export function draggable(
  el: HTMLElement | Document,
  options: DraggableOptions,
): Fn {
  const { canStart, onStart, onMove, onEnd, getPointerBounds } = options;
  const listener = (e: MouseEvent) => {
    if (e.button === 0 && (!canStart || canStart(e))) {
      onStart(e);
      document.body.style.userSelect = 'none';
      const { x: startX, y: startY } = e;
      const { top, right, bottom, left } = getPointerBounds?.(e) || {};
      const mousemoveListener = throttle((e: MouseEvent) => {
        let { x: endX, y: endY } = e;
        endX = inRange(
          endX,
          left || 0,
          document.body.clientWidth - (right || 0),
        );
        endY = inRange(
          endY,
          top || 0,
          document.body.clientHeight - (bottom || 0),
        );
        onMove(endX - startX, endY - startY);
      });
      const mouseupListener = (e: MouseEvent) => {
        onEnd && onEnd(e);
        document.body.style.userSelect = '';
        document.removeEventListener('mouseup', mouseupListener);
        document.removeEventListener('mousemove', mousemoveListener);
      };
      document.addEventListener('mouseup', mouseupListener);
      document.addEventListener('mousemove', mousemoveListener);
    }
  };
  (el as HTMLElement).addEventListener('mousedown', listener);
  return () => (el as HTMLElement).removeEventListener('mousedown', listener);
}

export function getTranslateCoordinate(el: HTMLElement): [number, number] {
  const transform = el.style.transform;
  const match = transform.includes('translate') && transform.match(/-?\d+/g);
  return match ? (match.map((item) => +item) as [number, number]) : [0, 0];
}

export function setTranslate(el: HTMLElement, x: number, y: number) {
  el.style.transform = `translate(${x}px, ${y}px)`;
}

export function getOptionsByAttrs<T extends Obj>(
  el: HTMLElement,
  names: { name: string; type?: 'string' | 'number' }[],
  prefix?: string,
): T {
  const options: Obj = {};
  names.forEach(({ name, type = 'string' }) => {
    const val = el.getAttribute(prefix ? prefix + '-' + name : name);

    if (val) {
      options[name] = type === 'number' ? toNum(val) : val;
    }
  });
  return options as T;
}

/**
 * position right, like: {left: auto; right: 0px;}
 */
export function isPositionRight(el: HTMLElement, initLeft: string) {
  const width = el.style.width;
  // test
  el.style.width = '1px';
  const { left, right } = getComputedStyle(el);
  const result = (left === 'auto' && right !== 'auto') || initLeft !== left;
  // restore
  el.style.width = width;
  return result;
}

/**
 * position right, like: {left: auto; right: 0px;}
 */
export function isPositionBottom(el: HTMLElement, initTop: string) {
  const height = el.style.height;
  // test
  el.style.height = '1px';
  const { top, bottom } = getComputedStyle(el);
  const result = (top === 'auto' && bottom !== 'auto') || initTop !== top;
  // restore
  el.style.height = height;
  return result;
}

function inRange(val: number, min: number, max: number) {
  return val < min ? min : Math.min(val, max);
}

function toNum(val: any) {
  return (typeof val === 'string' ? +val.replace(/\D/g, '') : +val) || 0;
}

export function limitAddVal(
  current: number,
  add: number,
  min: number | undefined,
  max: number | undefined,
) {
  if (add < 0) {
    if (min) {
      const minAdd = min - current;
      if (add < minAdd) {
        return minAdd;
      }
    }
  } else {
    if (max) {
      const maxAdd = max - current;
      if (add > maxAdd) {
        return maxAdd;
      }
    }
  }
  return add;
}
