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

export function draggable(
  el: HTMLElement | Document,
  options: {
    canDrag?: (e: MouseEvent) => boolean;
    onStart: Fn;
    onMove: (x: number, y: number) => void;
    onEnd?: Fn;
  },
): Fn {
  const { canDrag, onStart, onMove, onEnd } = options;
  const listener = (e: MouseEvent) => {
    if (e.button === 0 && (!canDrag || canDrag(e))) {
      onStart();
      document.body.style.userSelect = 'none';
      const { x: startX, y: startY } = e;
      const mousemoveListener = throttle(({ x: endX, y: endY }: MouseEvent) =>
        onMove(endX - startX, endY - startY),
      );
      const mouseupListener = () => {
        onEnd && onEnd();
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

    options[name] =
      type === 'number'
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          +val || 0
        : val;
  });
  return options as T;
}

/**
 * position right, like: {left: auto; right: 0px;}
 */
export function isPositionRight(el: HTMLElement, initLeft: string) {
  const { left, right } = getComputedStyle(el);
  return (left === 'auto' && right !== 'auto') || initLeft !== left;
}

/**
 * position right, like: {left: auto; right: 0px;}
 */
export function isPositionBottom(el: HTMLElement, initTop: string) {
  const { top, bottom } = getComputedStyle(el);
  return (top === 'auto' && bottom !== 'auto') || initTop !== top;
}
