import { DirectiveOptions } from 'vue';
import { movable } from '@/directives/move';
import { resizeable, unResizeable } from '@/directives/resize';
import { getTarget } from '@/directives/utils';

/**
 * Window 窗口化指令
 * @example
 * <div v-window></div>
 * <div v-window window-header=".trigger">
 *   <el-button class="trigger">trigger</el-button>
 * </div>
 */
const Window: DirectiveOptions = {
  inserted(el: HTMLElement, { value }) {
    const target = getTarget(el, value);

    // margin can not be 'auto'
    target.style.margin = getComputedStyle(target).margin;
    // transition cause caton
    target.style.transition = 'none';

    let resizing = false;
    resizeable(target, {
      onHover: () => (resizing = true),
      onBlur: () => (resizing = false)
    });
    movable(target, {
      headerSelector: el.getAttribute('window-header') as string,
      canMove: () => !resizing
    });
  },
  unbind(el, { value }) {
    const target = getTarget(el, value);
    unResizeable(target);
  }
};

export default Window;
