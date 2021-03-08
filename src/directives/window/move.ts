import {
  draggable,
  getTarget,
  getTranslateCoordinate,
  setTranslate
} from './utils';

export function movable(
  el: HTMLElement,
  {
    headerSelector,
    canMove,
    onStart,
    onEnd
  }: {
    headerSelector?: string;
    canMove?: () => boolean;
    onStart?: Function;
    onEnd?: Function;
  } = {}
) {
  const target = getTarget(el, headerSelector);
  let initX: number;
  let initY: number;
  draggable(
    target,
    () => (canMove ? canMove() : true),
    () => {
      const [x, y] = getTranslateCoordinate(el);
      initX = x;
      initY = y;
      onStart && onStart();
    },
    (x, y) => {
      setTranslate(el, x + initX, y + initY);
    },
    onEnd
  );
}
