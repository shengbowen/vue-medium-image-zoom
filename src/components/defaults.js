/* eslint-disable */
export const transitionDuration = 300

const defaults = {
  styles: {
    image: {
      cursor          : 'zoom-in',
    },
    zoomImage: {
      cursor          : 'zoom-out',
      position        : 'absolute',
      transition      : `transform ${transitionDuration}ms`,
      transform       : 'translate3d(0, 0, 0) scale(1)',
      transformOrigin : 'center center',
      willChange      : 'transform, top, left',
    },
    zoomContainer: {
      position        : 'fixed',
      top             : 0,
      right           : 0,
      bottom          : 0,
      left            : 0,
      zIndex          : 999,
    },
    overlay: {
      position        : 'absolute',
      top             : 0,
      right           : 0,
      bottom          : 0,
      left            : 0,
      backgroundColor : '#fff',
      opacity         : 0,
      transition      : `opacity ${transitionDuration}ms`,
    },
  },
};

export default defaults;
