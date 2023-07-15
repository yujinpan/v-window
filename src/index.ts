// 主组件
import type { VueConstructor } from 'vue';

import Window from '@/directives/window';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Window.install = (vue: VueConstructor) => {
  vue.directive('window', Window);
};

export default Window;
