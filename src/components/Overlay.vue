<template>
  <div :style="customStyle"></div>
</template>

<script>
import defaults from './defaults';

export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    defaultStyle: {
      type: Object,
      required: true,
    },
  },

  // mounted() {
  //   this.isVisible = true;
  // },

  computed: {
    customStyle() {
      // convert bool to 0 or 1
      const opacity = this.isVisible & 1; // eslint-disable-line
      return Object.assign(
        {},
        defaults.styles.overlay,
        { opacity },
        this.defaultStyle,
      );
    },
  },
};
</script>

