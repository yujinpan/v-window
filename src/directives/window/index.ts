import type { ObjectDirective } from 'vue';

import { movable } from './move';
import { resizeable, unResizeable } from './resize';
import { getOptionsByAttrs, getTarget } from './utils';

/**
 * Window 窗口化指令
 * @example
 * - simple:
 * <div v-window></div>
 *
 * - with el-dialog
 * <el-dialog
 *   v-window=".el-dialog"
 *   window-header=".el-dialog__header"
 * >
 * </el-dialog>
 *
 * - all options:
 * <div
 *   v-window.noMove.noResize="'.window'"
 *   window-header=".header"
 *   window-min-width="100"
 *   window-min-height="100"
 *   window-max-width="1000"
 *   window-max-height="1000"
 *   window-top="100"
 *   window-right="100"
 *   window-bottom="100"
 *   window-left="100"
 * >
 *   <div class="window">
 *     <div class="header">trigger</div>
 *   </div>
 * </div>
 */
const Window: ObjectDirective = {
  inserted(el: HTMLElement, { value, modifiers }) {
    const target = getTarget(el, value);
    const options = getOptionsByAttrs<{
      header: string;
      'min-width': number;
      'min-height': number;
      'max-width': number;
      'max-height': number;
      top: number;
      right: number;
      bottom: number;
      left: number;
    }>(
      el,
      [
        { name: 'header' },
        { name: 'min-width', type: 'number' },
        { name: 'min-height', type: 'number' },
        { name: 'max-width', type: 'number' },
        { name: 'max-height', type: 'number' },
        { name: 'top', type: 'number' },
        { name: 'right', type: 'number' },
        { name: 'bottom', type: 'number' },
        { name: 'left', type: 'number' },
      ],
      'window',
    );
    const getPointerBounds = () => {
      return options;
    };

    // margin can not be 'auto'
    target.style.margin = getComputedStyle(target).margin;
    // transition cause caton
    target.style.transition = 'none';

    let resizing = false;
    !modifiers.noResize &&
      resizeable(target, {
        onHover: () => (resizing = true),
        onBlur: () => (resizing = false),
        getPointerBounds,
        minWidth: options['min-width'],
        minHeight: options['min-height'],
        maxWidth: options['max-width'],
        maxHeight: options['max-height'],
      });
    !modifiers.noMove &&
      movable(target, {
        headerSelector: options.header,
        canMove: () => !resizing,
        getPointerBounds,
      });
  },
  unbind(el, { value, modifiers }) {
    !modifiers.noResize && unResizeable(getTarget(el, value));
  },
};

export default Window;
