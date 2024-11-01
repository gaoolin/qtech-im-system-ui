// mask.js
class Mask {
  constructor() {
    // 创建 DOM 元素，加载 HTML 模板
    const template = document.getElementById('mask-template').innerHTML;
    const container = document.createElement('div');
    container.innerHTML = template;
    document.body.appendChild(container);

    // 获取 DOM 元素
    this.uploadMask = document.getElementById('mask');
    this.uploadProgress = document.getElementById('upload-progress');
    this.uploadDetails = document.getElementById('upload-details');
    this.uploadedBytesSpan = document.getElementById('uploaded-bytes');
    this.totalBytesSpan = document.getElementById('total-bytes');
    this.uploadPercentageSpan = document.getElementById('upload-percentage');
  }

  // 格式化字节数
  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  }

  // 更新上传进度
  updateUploadProgress(uploadedBytes, totalBytes, showDetails = true) {
    const progress = Math.max(0, Math.min(100, (uploadedBytes / totalBytes) * 100));
    this.uploadProgress.style.width = progress + '%';

    if (showDetails) {
      this.uploadDetails.style.display = 'block';
      this.uploadedBytesSpan.textContent = this.formatBytes(uploadedBytes);
      this.totalBytesSpan.textContent = this.formatBytes(totalBytes);
      this.uploadPercentageSpan.textContent = progress.toFixed(2);
    } else {
      this.uploadDetails.style.display = 'none';
    }
  }

  // 显示上传遮罩
  showUploadMask() {
    this.uploadMask.style.display = 'flex';
  }

  // 隐藏上传遮罩
  hideUploadMask() {
    this.uploadMask.style.display = 'none';
  }
}

export default Mask;
