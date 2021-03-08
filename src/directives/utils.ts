export function throttle(fn: Function & { __throttle__?: any }, time = 0) {
  let lastArgs: any;
  return function() {
    if (!fn.__throttle__) {
      fn.__throttle__ = setTimeout(() => {
        fn(...arguments);
        fn.__throttle__ = null;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, time);
    } else {
      lastArgs = arguments;
    }
  };
}

export function debounce(fn: Function & { __debounce__?: any }, time = 60) {
  return function() {
    if (fn.__debounce__) clearTimeout(fn.__debounce__);
    fn.__debounce__ = setTimeout(() => {
      fn(...arguments);
      fn.__debounce__ = null;
    }, time);
  };
}

export function getTarget(el: HTMLElement, selector?: string): HTMLElement {
  return selector ? el.querySelector(selector) || el : el;
}

export function draggable(
  el: HTMLElement | Document,
  canDrag: (e: MouseEvent) => boolean,
  onStart: Function,
  onMove: (x: number, y: number) => void,
  onEnd?: Function
): Function {
  const listener = (e: MouseEvent) => {
    if (e.button === 0 && canDrag(e)) {
      onStart();
      document.body.style.userSelect = 'none';
      const { x: startX, y: startY } = e;
      const mousemoveListener = throttle(({ x: endX, y: endY }: MouseEvent) =>
        onMove(endX - startX, endY - startY)
      );
      const mouseupListener = () => {
        onEnd && onEnd();
        document.body.style.userSelect = '';
        document.removeEventListener('mouseup', mouseupListener, true);
        document.removeEventListener('mousemove', mousemoveListener, true);
      };
      document.addEventListener('mouseup', mouseupListener, true);
      document.addEventListener('mousemove', mousemoveListener, true);
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
