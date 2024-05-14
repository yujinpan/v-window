// 主组件
import type { VueConstructor } from 'vue';

import Window from '@/directives/window';

export * from './utils/composite';
export * from './utils/move';
export * from './utils/resize';
export * from './utils/utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Window.install = (vue: VueConstructor) => {
  vue.directive('window', Window);
};

export default Window;
