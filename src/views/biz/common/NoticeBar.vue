<template>
  <div class="notice-bar" ref="noticeBarRef">
    <div
      class="notice-bar-content"
      ref="contentRef"
      :style="contentStyle"
      @mouseenter="pauseAnimate"
      @mouseleave="resumeAnimate"
    >
      <slot :notices="notices" />
      <template v-if="animateFlag">
        <span class="content-headway" :style="{ width: `${headway}px` }"></span>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoticeBar',
  props: {
    notices: {
      type: Array,
      required: true
    },
    speed: {
      type: Number,
      default: 50
    },
    headway: {
      type: Number,
      default: 60
    },
    pauseOnHover: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      contentStyle: {
        transitionDuration: '0s',
        transform: 'translateX(0px)'
      },
      contentWidth: 0,
      time: 0,
      timer: undefined,
      animateFlag: true,
      isPaused: false,
      currentTranslateX: 0
    };
  },
  methods: {
    init() {
      const barWidth = this.$refs.noticeBarRef.offsetWidth;
      const contentWidth = this.$refs.contentRef.offsetWidth;
      if (contentWidth >= barWidth) {
        this.contentWidth = contentWidth + this.headway;
        this.animateFlag = true;
        this.openCycle();
      }
    },
    openCycle() {
      this.time = this.contentWidth / this.speed;
      this.startAnimate();
      this.timer = setInterval(() => {
        this.startAnimate();
      }, this.time * 1000);
    },
    startAnimate() {
      if (!this.isPaused) {
        this.currentTranslateX = 0;
        this.contentStyle = {
          transitionDuration: '0s',
          transform: `translateX(${this.currentTranslateX}px)`
        };
        setTimeout(() => {
          this.currentTranslateX = -this.contentWidth;
          this.contentStyle = {
            transitionDuration: `${this.time}s`,
            transform: `translateX(${this.currentTranslateX}px)`
          };
        }, 50);
      }
    },
    pauseAnimate() {
      if (this.pauseOnHover) {
        this.isPaused = true;
        const computedStyle = window.getComputedStyle(this.$refs.contentRef);
        const matrix = new DOMMatrix(computedStyle.transform);
        this.currentTranslateX = matrix.m41;
        this.contentStyle.transitionDuration = '0s';
        this.contentStyle.transform = `translateX(${this.currentTranslateX}px)`;
      }
    },
    resumeAnimate() {
      if (this.pauseOnHover && this.isPaused) {
        this.isPaused = false;
        const remainingTime = (this.contentWidth + this.currentTranslateX) / this.speed;
        this.contentStyle.transitionDuration = `${remainingTime}s`;
        this.contentStyle.transform = `translateX(-${this.contentWidth}px)`;
      }
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    clearInterval(this.timer);
  }
};
</script>


<style lang="scss" scoped>
.notice-bar {
  position: fixed;
  display: flex;
  top: 0px;
  flex: 1;
  width: 100%;
  height: 3%;
  align-items: center;
  overflow: hidden;
  background: var(--notice-bar-bg, #e6a23c);

  .notice-bar-content {
    position: absolute;
    white-space: nowrap;
    transition-timing-function: linear;
    .content-headway {
      display: inline-block;
    }
  }
}
</style>
