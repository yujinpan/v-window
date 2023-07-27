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
  boundsTarget: HTMLElement;
};

export function draggable(
  el: HTMLElement | Document,
  options: DraggableOptions,
): Fn {
  const { canStart, onStart, onMove, onEnd, getPointerBounds, boundsTarget } =
    options;
  const listener = (e: MouseEvent) => {
    if (e.button === 0 && (!canStart || canStart(e))) {
      onStart(e);
      document.body.style.userSelect = 'none';

      const overlayBoundsArr = getOverlayBoundsArr(boundsTarget);
      let inOverlay = false;

      const { x: startX, y: startY } = e;
      const bounds = getPointerBounds?.(e) || {};
      const mousemoveListener = throttle((e: MouseEvent) => {
        // handle move with no overlay
        if (isInBoundsArr(overlayBoundsArr, e)) {
          inOverlay = true;
          return;
        }

        const offsetBounds = getOffsetParentRange(boundsTarget, bounds);

        // leave overlay must be not out first
        if (inOverlay && !isContainsPoint(offsetBounds, e)) {
          return;
        } else {
          inOverlay = false;
        }

        const { left, right, top, bottom } = offsetBounds;
        let { x: endX, y: endY } = e;
        endX = inRange(endX, left, right);
        endY = inRange(endY, top, bottom);
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
export function isPositionRight(el: HTMLElement) {
  const initLeft = getComputedStyle(el).left;
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
export function isPositionBottom(el: HTMLElement) {
  const initTop = getComputedStyle(el).top;
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

function getOffsetParentRange(el: HTMLElement | undefined, bounds: Bounds) {
  const parent = el?.offsetParent || document.body;
  const { x, y, width, height } = parent.getBoundingClientRect();
  return {
    left: x + (bounds.left || 0),
    right: x + width - (bounds.right || 0),
    top: y + (bounds.top || 0),
    bottom: y + height - (bounds.bottom || 0),
  };
}

function isInBoundsArr(boundsArr: Required<Bounds>[], e: MouseEvent) {
  return boundsArr.some(
    (item) =>
      e.y >= item.top &&
      e.y <= item.bottom &&
      e.x >= item.left &&
      e.x <= item.right,
  );
}

function getOverlayBoundsArr(el: HTMLElement) {
  const oldStyle = el.getAttribute('style');
  el.setAttribute(
    'style',
    'position:absolute;top:0;left:0;width:100%;height:100%;',
  );
  const result = mergeBoundsArr(
    getIntersectElements(el).map((item) => item.getBoundingClientRect()),
  );
  el.setAttribute('style', oldStyle as any);
  return result;
}

function getIntersectElements(el: HTMLElement): HTMLElement[] {
  return deDup(
    getInterpolationPoints(el.getBoundingClientRect()).flatMap((item) => {
      const elements = document
        .elementsFromPoint(item[0], item[1])
        .filter((item) => item === el || !el.contains(item));
      const findIndex = elements.findIndex((item) => item === el);
      return elements.slice(0, findIndex >= 0 ? findIndex : 0);
    }),
  );
}

function deDup(arr: any[]) {
  return Array.from(new Set(arr));
}

export function mergeBoundsArr(boundsArr: Required<Bounds>[]) {
  boundsArr = deDepBoundsArr(boundsArr);

  return boundsArr.filter((item, index, arr) =>
    arr.every((bounds) => item === bounds || !isContainsBounds(bounds, item)),
  );
}

function deDepBoundsArr(boundsArr: Required<Bounds>[]) {
  const result: Required<Bounds>[] = [];

  boundsArr.forEach((item) => {
    if (
      result.every((bounds) => JSON.stringify(bounds) !== JSON.stringify(item))
    ) {
      result.push(item);
    }
  });

  return result;
}

function isContainsBounds(source: Required<Bounds>, target: Required<Bounds>) {
  return (
    source.top <= target.top &&
    source.right >= target.right &&
    source.bottom >= target.bottom &&
    source.left <= target.left
  );
}

function isContainsPoint(
  source: Required<Bounds>,
  point: { x: number; y: number },
) {
  return isContainsBounds(source, {
    top: point.y,
    right: point.x,
    bottom: point.y,
    left: point.x,
  });
}

function getInterpolationPoints(bounds: Required<Bounds>, distance = 50) {
  const result: number[][] = [];
  for (let i = bounds.left + 1; i <= bounds.right - 1; i += distance) {
    for (let j = bounds.top + 1; j <= bounds.bottom - 1; j += distance) {
      result.push([i, j]);
    }
  }
  return result;
}
