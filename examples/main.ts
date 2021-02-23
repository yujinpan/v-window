import Vue from 'vue';
// @ts-ignore
import App from './App.vue';

import './plugins/element';
import './styles/index.scss';

import VueHighlight from 'highlight-vue';
import 'highlight.js/styles/atom-one-light.css'; // import code style

Vue.use(VueHighlight);

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  render: (h) => h(App)
});
