# v-window

v-window description

## Usage

### Install

```
npm install --save v-window
```

### Require element-ui

If your project does not use element-ui,
you need to introduce a separate element-ui package, like this:

```js
import 'v-window/lib/element-ui';
```

### Global registration

```js
import Vue from 'vue';
import Component from 'v-window';

Vue.use(Component);
```

### In-component registration

```js
import Component from 'v-window';

export default {
  components: {
    Component
  }
};
```

### Complete example

```xml
<template>
  <div></div>
</template>

<script>
export default {};
</script>
```
