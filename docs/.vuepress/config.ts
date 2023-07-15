import path from 'path';
import { defineConfig } from 'vuepress/config';

export default defineConfig({
  base: '/v-window/',
  title: 'v-window',
  description: 'v-window description',
  head: [...getGAHead()],
  themeConfig: {
    repo: 'v-window',
    lastUpdated: 'Last Updated',
    logo: '/logo.svg',
    sidebar: 'auto',
  },
  plugins: [
    'vuepress-plugin-component-demo' as any,
    () => ({
      name: 'readme',
      additionalPages() {
        return [
          {
            path: '/',
            filePath: path.resolve(__dirname, '../../README.md'),
          },
        ];
      },
    }),
  ],
});

function getGAHead(): HeadTags {
  return process.env.NODE_ENV === 'production'
    ? [
        [
          'script',
          {
            async: true,
            src: 'https://www.googletagmanager.com/gtag/js?id=G-S66MPLRFJZ',
          },
          '',
        ],
        [
          'script',
          {},
          `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-S66MPLRFJZ');
`,
        ],
      ]
    : [];
}
