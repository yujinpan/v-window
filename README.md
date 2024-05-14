# v-window

Move and resize the "window".

<demo name="base-usage" />

## Usage

### Install

```
npm install --save v-window
```

### Global registration

```js
import Vue from "vue";
import Window from "v-window";

Vue.use(Window);
```

### In-component registration

```js
import Window from "v-window";

export default {
  directives: {
    Window
  }
};
```

### Options

- value: the move target element selector
- modifier `noMove`: disabled move
- modifier `noResize`: disabled resize
- attr `window-header`: window's header element selector
- attr `window-min-width`: resize min width
- attr `window-min-height`: resize min height
- attr `window-max-width`: resize max width
- attr `window-max-height`: resize max height
- attr `window-top`: limit pointer top
- attr `window-right`: limit pointer right
- attr `window-bottom`: limit pointer bottom
- attr `window-left`: limit pointer left

### Complete example

```vue
<template>
  <div>
    - simple:
    <div v-window></div>

    - with el-dialog
    <el-dialog v-window="'.el-dialog'" window-header=".el-dialog__header">
    </el-dialog>

    - all options:
    <div
        v-window.noMove.noResize="'.window'"
        window-header=".header"
        window-min-width="100"
        window-min-height="100"
        window-max-width="1000"
        window-max-height="1000"
        window-top="100"
        window-right="100"
        window-bottom="100"
        window-left="100"
    >
      <div class="window">
        <div class="header">trigger</div>
      </div>
    </div>
  </div>
</template>

<script>
import Window from "v-window";

export default {
  directives: {
    Window
  }
};
</script>
```


### Composition API

- useDraggable
- useMovable
- useResizeable