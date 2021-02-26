<template>
  <div class="app cm-padding-medium cm-text-center">
    <h2>v-window</h2>
    <p class="cm-text-secondary">author: yujinpan - version: v{{ version }}</p>
    <el-divider></el-divider>
    <el-row class="cm-text-left" type="flex">
      <el-col :span="12">
        <Highlight :code="code" lang="xml" />
      </el-col>
      <el-col class="cm-text-left" :span="12">
        <div>
          <label>Function 1:</label>
          <el-dialog
            :visible="true"
            v-window
            window-header=".el-dialog__header"
            window-resize=".el-dialog"
          >
            <h1>Title</h1>
            <h2>Description</h2>
            <h3>Content</h3>
          </el-dialog>
        </div>
        <el-divider></el-divider>
        <el-link
          type="primary"
          href="https://github.com/yujinpan/v-window#attributes"
          >https://github.com/yujinpan/v-window</el-link
        >
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Window from '../src/directives/window';
import '@/element-ui.ts';

const version = require('../package').version;

export default {
  directives: {
    Window
  },
  data() {
    return {
      version,
      code: require('./template/example1').default
    };
  }
};
</script>

<style lang="scss" scoped>
@import './styles/common-variables';

.app {
  .el-col {
    padding: $spacing-medium;
    border-right: $--border-base;
    &:last-of-type {
      border-right: 0;
    }
  }
}
</style>
