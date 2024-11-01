<template>
  <div class="container">
    <transition name="modal-fade">
      <div class="modal-container" v-show="visible" :style="{ width: width }">
        <!-- 头部标题 -->
        <div class="modal-header">
          <div class="modal-title">{{ title }}</div>
          <i class="iconfont close-icon" @click="close">&#xe7fc;</i>
        </div>
        <!-- 内容区域 -->
        <div class="modal-content">
          <slot></slot>
        </div>
        <!-- 底部按钮 -->
        <div class="modal-footer" v-show="showOperation">
          <div class="modal-btn">
            <button class="cancel" ref="cancelBtn" @click="close" @mousedown="cancelMouseDown" @mouseup="cancelMouseUp">取消</button>
            <button class="ok" @click="ok">确认</button>
          </div>
        </div>
      </div>
    </transition>
    <!-- 遮罩层 -->
    <div class="mask" v-show="visible" @click="close"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  props: {
    // 模态框标题
    title: {
      type: String,
      default: () => {
        return '模态框标题'
      },
    },
    // 显示隐藏控件
    visible: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    // 隐藏底部区域
    showOperation: {
      type: Boolean,
      dafault: () => {
        return true
      },
    },
    // 宽度
    width: {
      type: String,
      default: '250px',
    },
  },
  methods: {
    // 取消
    close() {
      this.$emit('cancel')
      this.$emit('update:visible', false)
    },
    // 确认
    ok() {
      this.$emit('submit')
      this.$emit('update:visible', false)
    },
    // 取消按钮 鼠标按下事件
    cancelMouseDown() {
      this.$refs.cancelBtn.style.color = '#096dd9'
      this.$refs.cancelBtn.style.border = '1px solid #096dd9'
    },
    // 取消按钮 鼠标松开事件
    cancelMouseUp() {
      this.$refs.cancelBtn.style.color = '#595959'
      this.$refs.cancelBtn.style.border = '1px solid #d9d9d9'
    },
  },
  watch: {
    // 操作遮罩层的展示/隐藏
    visible() {
      if (this.visible == true) {
        document.querySelector('body').setAttribute('style', 'overflow:hidden !important;')
      } else {
        document.querySelector('body').removeAttribute('style')
      }
    },
  },
}
</script>

<style scoped lang="scss">
.modal-container {
  z-index: 999;
  background-color: #fff;
  min-width: 250px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: none;
  border-radius: 4px;
  transition: 0.5s;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.modal-header {
  width: 100%;
  height: 50px;
  border: none;
  border-bottom: 1px solid #e8e8e8;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-title {
  color: #262626;
  font-weight: 600;
  font-size: 17px;
}
.close-icon {
  color: #4d4d4d;
  cursor: pointer;
  width: 80px;
  text-align: right;
}
.modal-content {
  width: 100%;
  min-height: 100px;
  border: none;
  border-radius: none;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.modal-footer {
  width: 100%;
  height: 60px;
  border: none;
  border-top: 1px solid #e8e8e8;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.modal-btn {
  width: 150px;
  display: flex;
  justify-content: space-between;
}
.cancel {
  border: 1px solid #d9d9d9;
  background-color: #fff;
  color: #595959;
  width: 70px;
  height: 32px;
  border-radius: 4px;
  font-size: 14px;
  transition: 0.5s;
}
.cancel :hover {
  border: 1px solid #40a9ff;
  color: #40a9ff;
}
.ok {
  border: 1px solid #1890ff;
  background-color: #1890ff;
  color: #ffffff;
  width: 70px;
  height: 32px;
  border-radius: 4px;
  font-size: 14px;
  transition: 0.5s;
}
.ok :hover {
  border: 1px solid #40a9ff;
  background-color: #40a9ff;
}
.mask {
  z-index: 998;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
}
.modal-fade-enter-active {
  transition: all 0.3s ease;
}
.modal-fade-leave-active {
  transition: all 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  transform: translateX(-400px);
  opacity: 0;
}
@font-face {
  font-family: 'iconfont'; /* Project id 3147059 */
  src: url('//at.alicdn.com/t/font_3147059_ypw5b7teii.woff2?t=1648289780095') format('woff2'), url('//at.alicdn.com/t/font_3147059_ypw5b7teii.woff?t=1648289780095') format('woff'),
  url('//at.alicdn.com/t/font_3147059_ypw5b7teii.ttf?t=1648289780095') format('truetype');
}
.iconfont {
  font-family: 'iconfont' !important;
  font-size: 18px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}
</style>
