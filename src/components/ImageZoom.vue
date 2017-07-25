<template>
  <span v-if="shouldPreload && zoomImage && zoomImage.src">
    <link rel="preload" :href="zoomImage.src" as="image">
    <img :src="image.src"
      :alt="image.alt"
      ref="image"
      :style="getImageStyle()"
      :class="image.className"
      @click="handleZoom"/>
  </span>
  <img :src="image.src" v-else
      :alt="image.alt"
      ref="image"
      :style="getImageStyle()"
      :class="image.className"
      @click="handleZoom"/>
</template>

<script>
import Vue from 'vue';
import Zoom from './Zoom';
import defaults from './defaults';

function createPortal(tag) {
  const portal = document.createElement(tag);
  document.body.appendChild(portal);
  return portal;
}

function removePortal(portal) {
  document.body.removeChild(portal);
}

export default {
  data() {
    return {
      hasAlreadyLoaded: false,
      isZoomed: false,
      image: this.defaultImage,
    };
  },

  props: {
    shouldPreload: {
      type: Boolean,
      default: false,
    },
    shouldReplaceImage: {
      type: Boolean,
      default: true,
    },
    shouldRespectMaxDimension: {
      type: Boolean,
      default: false,
    },
    zoomMargin: {
      type: Number,
      default: 40,
    },
    defaultStyles: {
      type: Object,
      default: () => { // eslint-disable-line
        return {
          zoomContainer: {},
          overlay: {},
          image: {},
          zoomImage: {},
        };
      },
    },
    zoomImage: {
      type: Object,
      default: () => ({}),
    },
    defaultImage: {
      type: Object,
      required: true,
    },
    shouldHandleZoom: {
      type: Function,
      default: () => true,
    },
    onZoom: {
      type: Function,
      default: () => {},
    },
    onUnzoom: {
      type: Function,
      default: () => {},
    },
  },

  watch: {
    isZoomed(val, oldVal) {
      if (val !== oldVal) {
        if (val) this.renderZoomed();
        else if (this.zoomInstance) this.zoomInstance.handleUnzoom();
      }
    },
  },

  mounted() {
    if (this.isZoomed) this.renderZoomed();
  },

  beforeDestroy() {
    this.removeZoomed();
  },

  methods: {
    renderZoomed() {
      this.portal = createPortal('div');

      const { zoomImage, defaultStyles, hasAlreadyLoaded,
              shouldRespectMaxDimension, zoomMargin, handleUnzoom } = this;

      const image = this.$refs.image;

      const ZoomInstance = Vue.extend({ // eslint-disable-line
        template: `<Zoom
                    :zoomImage="zoomImage"
                    :defaultStyles="defaultStyles"
                    :image="image"
                    :hasAlreadyLoaded="hasAlreadyLoaded"
                    :shouldRespectMaxDimension="shouldRespectMaxDimension"
                    :zoomMargin="zoomMargin"
                    :onUnzoom="onUnzoom" />`,
        components: {
          Zoom,
        },
        data() {
          return {
            zoomImage,
            image,
            defaultStyles,
            hasAlreadyLoaded,
            shouldRespectMaxDimension,
            zoomMargin,
          };
        },
        methods: {
          onUnzoom: handleUnzoom,
        },
      });

      const zoomInstance = new ZoomInstance().$mount(this.portal);

      /**
      * the $mount method upon will change
      * the dom node of portal, so get again here
      */
      this.portal = zoomInstance.$el;

      this.zoomInstance = zoomInstance;
    },

    removeZoomed() {
      if (this.portal) {
        // this.zoomInstance.$destory();
        removePortal(this.portal);
        delete this.zoomInstance;
        delete this.portal;
      }
    },

    getImageStyle() {
      const style = Object.assign(
        {},
        this.isZoomed && { visibility: 'hidden' },
      );

      return Object.assign(
        {},
        defaults.styles.image,
        style,
        this.defaultStyles.image,
        this.image.style,
      );
    },

    handleZoom() {
      if (this.shouldHandleZoom(event)) {
        this.isZoomed = true;
        this.$nextTick(this.onZoom);
      }
    },

    /**
    * This gets passed to the zoomed component as a callback
    * to trigger when the time is right to shut down the zoom.
    * If `shouldReplaceImage`, update the normal image we're showing
    * with the zoomed image -- useful when wanting to replace a low-res
    * image with a high-res one once it's already been downloaded.
    * It also cleans up the zoom references and then updates state.
    */
    handleUnzoom(src) {
      return () => {
        const changes = Object.assign(
          {},
          { isZoomed: false },
          { hasAlreadyLoaded: true },
          this.shouldReplaceImage && { image: Object.assign({}, this.image, { src }) },
        );

        this.removeZoomed();

        Object.assign(this, changes);

        this.$nextTick(this.onUnzoom);
      };
    },
  },
};
</script>

