module.exports = {
  banner:
    '/*!\n' +
    ` * v-window v${require('./package.json').version}\n` +
    ` * (c) 2021-${new Date().getFullYear()} yujinpan\n` +
    ' * Released under the MIT License.\n' +
    ' */\n',
  outputDir: 'lib'
};
