<template>
  <div @click="handleUnzoom" :style="ZoomContainerStyle">
    <Overlay
      :isVisible="isZoomed"
      :defaultStyle="defaultStyles.overlay"
    />
    <img
      :alt="zoomImage.alt"
      :class="zoomImage.className"
      :src="src"
      :style="getZoomImageStyle()"
    />
  </div>
</template>

<script>
import Overlay from './Overlay';
import defaults, { transitionDuration } from './defaults';

/**
 * Figure out how much to scale based
 * solely on no maxing out the browser
 */
function getScale({ width, height, zoomMargin }) {
  const scaleX = window.innerWidth / (width + zoomMargin);
  const scaleY = window.innerHeight / (height + zoomMargin);

  return Math.min(scaleX, scaleY);
}

/**
 * Figure out how much to scale so you're
 * not larger than the original image
 */
function getMaxDimensionScale({ width, height, naturalWidth, naturalHeight, zoomMargin }) {
  const scale = getScale({ width: naturalWidth, height: naturalHeight, zoomMargin });
  const ratio = naturalWidth > naturalHeight
    ? naturalWidth / width
    : naturalHeight / height;

  return scale > 1 ? ratio : scale * ratio;
}

export default {
  data() {
    return {
      hasLoaded: false,
      isZoomed: true,
      src: this.image.currentSrc || this.image.src,
    };
  },

  props: {
    zoomImage: {
      type: Object,
      required: true,
    },
    image: {
      type: HTMLImageElement,
      required: true,
    },
    hasAlreadyLoaded: {
      type: Boolean,
      required: true,
    },
    defaultStyles: {
      type: Object,
      required: true,
    },
    zoomMargin: {
      type: Number,
      default: 0,
    },
    onUnzoom: {
      type: Function,
      default: () => {},
    },
    shouldRespectMaxDimension: {
      type: Boolean,
    },
  },

  components: {
    Overlay,
  },

  mounted() {
    const { hasAlreadyLoaded, zoomImage: { src, srcSet } } = this;

    this.hasLoaded = true;
    if ((src || srcSet) && !hasAlreadyLoaded) this.fetchZoomImage();
    this.addListeners();
  },

  beforeDestroy() {
    this.removeListeners();
  },

  computed: {
    ZoomContainerStyle() {
      return Object.assign(
        {},
        defaults.styles.zoomContainer,
        this.defaultStyle,
      );
    },
  },

  methods: {
    fetchZoomImage() {
      const { src, srcSet, sizes } = this.zoomImage;
      const img = new Image();

      img.src = src;
      if (srcSet) img.srcset = srcSet;
      if (sizes) img.sizes = sizes;

      const onLoad = () => {
        if (this.isZoomed) {
          this.hasLoaded = true;
          this.src = img.currentSrc || img.src;
        }

        /**
        * If using srcset, future resize events can trigger
        * additional onload events to fire.
        * Remove listener after first load
        */
        img.removeEventListener('load', onLoad);
      };

      img.addEventListener('load', onload);
    },

    addListeners() {
      this.isTicking = false;
      window.addEventListener('resize', this.handleResize);
      window.addEventListener('scroll', this.handleScroll, true);
      window.addEventListener('keyup', this.handleKeyUp);
      window.addEventListener('ontouchstart', this.handleTouchStart);
      window.addEventListener('ontouchmove', this.handleTouchMove);
      window.addEventListener('ontouchend', this.handleTouchEnd);
      window.addEventListener('ontouchcancel', this.handleTouchEnd);
    },

    removeListeners() {
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('scroll', this.handleScroll, true);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('touchstart', this.handleTouchStart);
      window.removeEventListener('touchmove', this.handleTouchMove);
      window.removeEventListener('touchend', this.handleTouchEnd);
      window.removeEventListener('touchcancel', this.handleTouchEnd);
    },

    handleResize() {
      this.$forceUpdate();
    },

    handleScroll() {
      this.$forceUpdate();
      if (this.isZoomed) this.handleUnzoom();
    },

    handleKeyUp({ which }) { // eslint-disable-line
      const opts = {
        27: this.handleUnzoom,
      };

      if (opts[which]) return opts[which](); // eslint-disable-line
    },

    handleTouchStart(e) {
      this.yTouchPosition = e.touches[0].clientY;
    },

    handleTouchMove(e) {
      this.$forceUpdate();
      const touchChange = Math.abs(e.touches[0].clientY - this.yTouchPosition);
      if (touchChange > 10 && this.isZoomed) this.handleUnzoom();
    },

    handleTouchEnd() {
      delete this.yTouchPosition;
    },

    handleUnzoom(e) {
      if (e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
      this.isZoomed = false;
      this.$nextTick(() => {
        setTimeout(this.onUnzoom(this.src), transitionDuration);
      });
    },

    getZoomImageStyle() {
      const { image, shouldRespectMaxDimension, zoomImage, zoomMargin } = this;
      const imageOffset = image.getBoundingClientRect();

      const { top, left } = imageOffset;
      const { width, height, naturalWidth, naturalHeight } = image;

      const style = {
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
      };

      if (!this.hasLoaded || !this.isZoomed) {
        return Object.assign(
          {},
          defaults.styles.zoomImage,
          this.defaultStyles.zoomImage,
          this.style,
          style,
        );
      }

      // get the coords for center of the viewport
      const viewportX = window.innerWidth / 2;
      const viewportY = window.innerHeight / 2;

      // get the coords for center of the original image
      const imageCenterX = imageOffset.left + width / 2; // eslint-disable-line
      const imageCenterY = imageOffset.top + height / 2; // eslint-disable-line

      // Get offset amounts for image coords to be centered on screen
      const translateX = viewportX - imageCenterX;
      const translateY = viewportY - imageCenterY;

      const scale = shouldRespectMaxDimension && !zoomImage.src
        ? getMaxDimensionScale({ width, height, naturalWidth, naturalHeight, zoomMargin })
        : getScale({ width, height, zoomMargin });

      const zoomStyle = {
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
      };

      return Object.assign(
        {},
        defaults.styles.zoomImage,
        this.defaultStyles.zoomImage,
        style,
        zoomStyle,
      );
    },

  },
};
</script>

