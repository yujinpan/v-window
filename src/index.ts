// 主组件
import Window from '@/directives/window';
import { VueConstructor } from 'vue';

// @ts-ignore
Window.install = (vue: VueConstructor) => {
  vue.directive('window', Window);
};

export default Window;
