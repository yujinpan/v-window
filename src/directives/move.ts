import { getTarget, throttle } from '@/directives/utils';

export function movable(el: HTMLElement, selector?: string) {
  const target = getTarget(el, selector);
  target.addEventListener(
    'mousedown',
    ({ x: startX, y: startY }: MouseEvent) => {
      const oldTransition = el.style.transition;
      el.style.transition = 'none';

      const [initX, initY] = getTranslateCoordinate(el.style.transform);
      startX -= initX;
      startY -= initY;
      const mousemoveListener = throttle(({ x: endX, y: endY }: MouseEvent) => {
        el.style.transform = `translate(${endX - startX}px, ${endY -
          startY}px)`;
      });
      const mouseupListener = () => {
        el.style.transition = oldTransition;

        document.removeEventListener('mouseup', mouseupListener, true);
        document.removeEventListener('mousemove', mousemoveListener, true);
      };
      document.addEventListener('mouseup', mouseupListener, true);
      document.addEventListener('mousemove', mousemoveListener, true);
    }
  );
}

function getTranslateCoordinate(translate: string): [number, number] {
  return translate.includes('translate')
    ? (translate
        .replace(/translate\((-?\d+)px,\s?(-?\d+)px\)/, '$1,$2')
        .split(',')
        .map((item) => +item) as [number, number])
    : [0, 0];
}
