<template>
  <div v-if="visible" class="upload-mask">
    <div class="upload-mask-content">
      <div class="upload-icon"></div>
      <div class="upload-text">文件上传中，请稍候...</div>

      <!-- 上传进度条 -->
      <div class="upload-progress-bar">
        <div class="upload-progress" :style="{ width: validatedProgress + '%' }"></div>
      </div>

      <!-- 显示详细的上传信息 -->
      <div v-if="showDetails" class="upload-details">
        已上传: {{ formattedUploadedBytes }} / {{ formattedTotalBytes }} ({{ validatedProgress }}%)
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImUploadMask',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
    },
    uploadedBytes: {
      type: Number,
      default: 0,
    },
    totalBytes: {
      type: Number,
      default: 0,
    },
    showDetails: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    validatedProgress() {
      return Math.max(0, Math.min(100, this.progress));
    },
    formattedUploadedBytes() {
      return this.formatBytes(this.uploadedBytes);
    },
    formattedTotalBytes() {
      return this.formatBytes(this.totalBytes);
    },
  },
  methods: {
    formatBytes(bytes) {
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      if (bytes === 0) return '0 Bytes';
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
      return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    },
  },
};
</script>

<style scoped>
.upload-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.upload-mask-content {
  text-align: center;
  color: #fff;
  font-family: 'Arial', sans-serif;
}

.upload-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.upload-text {
  margin-bottom: 20px;
  font-size: 18px;
}

.upload-progress-bar {
  width: 300px;
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  overflow: hidden;
  margin: 0 auto;
}

.upload-progress {
  height: 100%;
  background: #4caf50;
  width: 0;
  transition: width 0.4s ease;
}

.upload-details {
  margin-top: 10px;
  font-size: 14px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

