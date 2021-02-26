import { getTarget, throttle } from '@/directives/utils';

export function resizeable(el: HTMLElement, selector?: string) {
  const target = getTarget(el, selector);
  let currentDirection: Direction | undefined;
  document.addEventListener(
    'mousemove',
    // @ts-ignore
    (target.__resizeable__ = throttle((e: MouseEvent) => {
      const range = getElementRange(target);
      const direction = getDirectionByRange(e, range);
      if (direction !== currentDirection) {
        console.log('change');
        currentDirection = direction;
        if (direction) {
          document.body.style.cursor = getCursorByDirection(direction);
        } else {
          document.body.style.cursor = '';
        }
      }
    }, 50)),
    true
  );
}

export function unResizeable(el: HTMLElement, selector?: string) {
  const target = getTarget(el, selector);
  // @ts-ignore
  if (target.__resizeable__) {
    // @ts-ignore
    document.removeEventListener('mousemove', target.__resizeable__, true);
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
    left: [leftMin, topMax, leftMax, bottomMin]
  };
}

function getDirectionByRange(
  { x, y }: { x: number; y: number },
  range: { [p in Direction]: number[] }
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

function getCursorByDirection(direction: Direction): string {
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
  }
}
