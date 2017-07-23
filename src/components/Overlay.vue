<template>
  <div :style="customStyle"></div>
</template>

<script>
const transitionDuration = 300;

const defaultStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: '#fff',
  opacity: 0,
  transition: `opacity ${ transitionDuration }`,
};

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
      const opacity = this.isVisible & 1; // convert bool to 0 or 1
      return Object.assign(
        {},
        defaultStyle,
        { opacity },
        this.defaultStyle,
      );
    },
  },
};
</script>

