import { DirectiveOptions } from 'vue';
import { movable, unMovable } from '@/directives/move';
import { resizeable, unResizeable } from '@/directives/resize';

/**
 * Window 窗口化指令
 * @example
 * <div v-window></div>
 * <div v-window window-header="trigger">
 *   <el-button class="trigger">trigger</el-button>
 * </div>
 */
const Window: DirectiveOptions = {
  inserted(el: HTMLElement, { value }) {
    movable(el, el.getAttribute('window-header') as string);
    resizeable(el, el.getAttribute('window-resize') as string);
  },
  unbind(el, { value }) {
    unMovable(el, el.getAttribute('window-header') as string);
    unResizeable(el, el.getAttribute('window-resize') as string);
  }
};

export default Window;
