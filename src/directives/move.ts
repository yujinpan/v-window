import { draggable, getTarget } from '@/directives/utils';

export function movable(el: HTMLElement, selector?: string) {
  const target = getTarget(el, selector);
  let oldTransition: string;
  let initX: number;
  let initY: number;
  draggable(
    target,
    () => {
      oldTransition = el.style.transition;
      el.style.transition = 'none';
      const [x, y] = getTranslateCoordinate(el.style.transform);
      initX = x;
      initY = y;
    },
    (x, y) => {
      el.style.transform = `translate(${x + initX}px, ${y + initY}px)`;
    },
    () => {
      el.style.transition = oldTransition;
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
