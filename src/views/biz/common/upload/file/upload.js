import Mask from '../mask/mask.js'; // 引入已原生化的 Mask 类

class ImFileUpload {
  constructor() {
    this.mask = new Mask(); // 实例化 Mask 类
    this.fileInput = document.getElementById('file-input');
    this.uploadArea = document.querySelector('.upload-area');
    this.uploadArea.addEventListener('click', this.triggerFileUpload.bind(this));
    this.fileInput.addEventListener('change', this.handleFileUpload.bind(this));

    this.acceptedFormats = 'zip,rar,7z'; // 可接受的文件格式
    this.hintText = '仅允许上传 zip、rar、7z 格式的压缩文件。';
    this.isUploading = false;
    this.uploadProgress = 0;
    this.uploadedBytes = 0;
    this.totalBytes = 0;
  }

  triggerFileUpload() {
    this.fileInput.click();
  }

  async handleFileUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadedBytes = 0;

    this.mask.showUploadMask(); // 显示上传遮罩

    for (const file of Array.from(files)) {
      if (!this.isFileValid(file)) {
        this.isUploading = false;
        this.mask.hideUploadMask(); // 隐藏上传遮罩
        return; // 终止操作
      }

      try {
        // 模拟上传过程，替换为真实上传代码
        const total = file.size;
        let uploaded = 0;

        // 模拟进度
        const interval = setInterval(() => {
          uploaded += total * 0.1; // 每次增加 10%
          if (uploaded > total) {
            uploaded = total;
          }

          this.updateProgress(uploaded, total);
          if (uploaded >= total) {
            clearInterval(interval);
          }
        }, 100);

        await new Promise((resolve) => setTimeout(resolve, total / 100)); // 模拟文件上传延迟

        this.$emit('upload-success', file);
        console.log(`文件 ${file.name} 上传成功`);
      } catch (error) {
        console.error(`文件 ${file.name} 上传失败: ${error.message}`);
      } finally {
        this.isUploading = false;
        this.uploadProgress = 0;
        this.mask.hideUploadMask(); // 隐藏上传遮罩
      }
    }
  }

  updateProgress(uploadedBytes, totalBytes) {
    this.uploadedBytes = uploadedBytes;
    this.totalBytes = totalBytes;
    this.uploadProgress = Math.round((uploadedBytes * 100) / totalBytes);

    // 更新 Mask 显示
    this.mask.updateUploadProgress(uploadedBytes, totalBytes);
  }

  isFileValid(file) {
    const acceptedTypes = this.acceptedFormats.split(',');
    const fileExtension = file.name.split('.').pop().toLowerCase();

    // 校验文件扩展名
    if (!acceptedTypes.includes(fileExtension)) {
      console.error(`不支持的文件类型: ${file.name}`);
      return false;
    }

    const fileNameParts = file.name.split('.');
    const baseName = fileNameParts.slice(0, -1).join('.'); // 获取不带扩展名的文件名
    const versionPattern = /_V(\d+)$/; // 匹配 "_V" 和数字的正则表达式

    // 校验文件名的前缀、版本号和扩展名
    if (baseName.charAt(0) !== baseName.charAt(0).toUpperCase()) {
      console.error(`文件名的前缀必须大写: ${file.name}`);
      return false;
    }

    if (!versionPattern.test(baseName)) {
      console.error(`文件名须符合规范，格式参考 "XXXX_V<版本号>.zip"，当前文件名为: ${file.name}`);
      return false;
    }

    // 检查版本号
    const versionMatch = baseName.match(versionPattern);
    if (versionMatch) {
      const version = versionMatch[1];
      if (!/^\d+$/.test(version)) {
        console.error(`版本号必须为数字: ${file.name}`);
        return false;
      }
    }
    return true; // 文件名有效
  }
}

// 初始化 ImFileUpload
document.addEventListener('DOMContentLoaded', () => {
  new ImFileUpload();
});
