<template>
  <div class="app cm-padding-medium cm-text-center">
    <el-dialog
      :visible="true"
      v-window="'.el-dialog'"
      window-header=".el-dialog__header"
      window-min-width="50"
      window-min-height="50"
      window-max-width="1500"
      window-max-height="800"
      width="900px"
    >
      <h2>v-window</h2>
      <p class="cm-text-secondary">
        author: yujinpan - version: v{{ version }}
      </p>
      <el-divider></el-divider>
      <el-row class="cm-text-left" type="flex">
        <el-col style="height: 500px;overflow: auto;" :span="12">
          <Highlight :code="code" lang="xml" />
        </el-col>
        <el-col class="cm-text-left" :span="12">
          <el-button type="primary" v-window
            >Try to move and resize me</el-button
          >
        </el-col>
      </el-row>
    </el-dialog>
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
