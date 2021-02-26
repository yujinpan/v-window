export function throttle(fn: Function & { __throttle__?: any }, time = 0) {
  return function() {
    if (!fn.__throttle__) {
      fn.__throttle__ = setTimeout(() => {
        fn(...arguments);
        fn.__throttle__ = null;
      }, time);
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
