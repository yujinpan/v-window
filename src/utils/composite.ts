import { computed, reactive, ref, watch } from 'vue';

import { movable } from '@/utils/move';
import type { MovableOptions } from '@/utils/move';
import type { ResizeableOptions } from '@/utils/resize';
import { resizeable, unResizeable } from '@/utils/resize';
import { draggable, noop } from '@/utils/utils';
import type { DraggableOptions, RefLike } from '@/utils/utils';

export type DraggableProps = DraggableOptions & {
  offset?: { x: number; y: number };
};

export const useDraggable = (
  el: RefLike<HTMLElement>,
  props: RefLike<DraggableProps> = {},
) => {
  const elRef = ref(el);
  const propsRef = ref(props);

  const offset = ref(propsRef.value.offset || { x: 0, y: 0 });
  const disabled = ref(false);

  const handleMove = (x: number, y: number, startX: number, startY: number) => {
    propsRef.value.onMove?.(x, y, startX, startY);
    offset.value.x += x;
    offset.value.y += y;
  };

  let destroy = noop;
  const start = () => {
    destroy();
    destroy = noop;

    elRef.value &&
      (destroy = draggable(elRef.value, {
        ...props,
        onMove: handleMove,
        canStart: (e) => {
          return (
            !disabled.value &&
            (!propsRef.value.canStart || propsRef.value.canStart(e))
          );
        },
      }));
  };
  watch(() => elRef.value, start, { immediate: true });

  return { start, destroy, offset, disabled };
};

export type ResizeableProps = ResizeableOptions & {
  rect?: { x: number; y: number; width: number; height: number };
};

export const useResizeable = (
  el: RefLike<HTMLElement>,
  props: RefLike<ResizeableProps> = {},
) => {
  const elRef = ref(el);
  const propsRef = ref(props);
  const disabled = ref(false);
  const rect = ref(propsRef.value.rect || { x: 0, y: 0, width: 0, height: 0 });

  const start = () => {
    destroy();
    elRef.value &&
      resizeable(elRef.value, {
        getStartState: () => rect.value,
        setMoveState: (_, state) => (rect.value = state),
        ...propsRef.value,
        canStart: (e) => {
          return (
            !disabled.value &&
            (!propsRef.value.canStart || propsRef.value.canStart(e))
          );
        },
      });
  };
  const destroy = () => elRef.value && unResizeable(elRef.value);

  watch(() => elRef.value, start, { immediate: true });

  const rectStyle = computed(() => rectToStyle(rect.value));

  return { disabled, start, destroy, rect, rectStyle };
};

export type MovableProps = MovableOptions & {
  offset?: { x: number; y: number };
};

export const useMovable = (
  el: RefLike<HTMLElement>,
  props: RefLike<MovableProps> = {},
) => {
  const elRef = ref(el);
  const propsRef = ref(props);

  const offset = ref(propsRef.value.offset || { x: 0, y: 0 });
  const disabled = ref(false);

  const start = () => {
    destroy();
    destroy = noop;

    elRef.value &&
      (destroy = movable(elRef.value, {
        getStartState: () => offset.value,
        setMoveState: (_, state) => (offset.value = state),
        ...propsRef.value,
        canStart: (e) => {
          return (
            !disabled.value &&
            (!propsRef.value.canStart || propsRef.value.canStart(e))
          );
        },
      }));
  };
  let destroy = noop;

  watch(() => elRef.value, start, { immediate: true });

  const offsetStyle = computed(() => ({
    transform: `translate(${offset.value.x}px, ${offset.value.y}px)`,
  }));

  return { disabled, start, destroy, offset, offsetStyle };
};

export type MoveAndResizeProps = Pick<
  ResizeableProps,
  'maxHeight' | 'minHeight' | 'maxWidth' | 'minWidth' | 'rect'
> &
  MovableProps;

export const useMoveAndResize = (
  el: RefLike<HTMLElement>,
  props: RefLike<MoveAndResizeProps> = {},
) => {
  const propsRef = ref(props);
  const disabled = ref(false);

  const rect = ref(propsRef.value.rect || { x: 0, y: 0, width: 0, height: 0 });
  const rectStyle = computed(() => rectToStyle(rect.value));

  let resizing = false;
  const movable = useMovable(el, {
    ...props,
    getStartState: () => rect.value,
    setMoveState: (_, state) => {
      Object.assign(rect.value, state);
    },
    canStart: (e) => {
      return (
        !disabled.value &&
        !resizing &&
        (!propsRef.value.canStart || propsRef.value.canStart(e))
      );
    },
  });
  const resizeable = useResizeable(el, {
    ...props,
    onHover: () => (resizing = true),
    onBlur: () => (resizing = false),
    getStartState: () => rect.value,
    setMoveState: (_, state) => {
      Object.assign(rect.value, state);
    },
    canStart: (e) => {
      return (
        !disabled.value &&
        (!propsRef.value.canStart || propsRef.value.canStart(e))
      );
    },
  });

  return {
    movable: reactive(movable),
    resizeable: reactive(resizeable),
    rect,
    rectStyle,
    disabled,
  };
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function rectToStyle(rect: Rect) {
  return {
    transform: `translate(${rect.x}px, ${rect.y}px)`,
    width: rect.width ? rect.width + 'px' : undefined,
    height: rect.height ? rect.height + 'px' : undefined,
  };
}
