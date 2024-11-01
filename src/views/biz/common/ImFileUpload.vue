<template>
  <div class="upload-wrapper">
    <label for="file-input" class="upload-area">
      <i class="icon-upload">&#128190;</i>
      <span class="upload-text">
        将文件拖到此处，或
        <a href="javascript:void(0)" @click="triggerFileUpload" class="upload-link">点击上传</a>
      </span>
      <span class="upload-hint">{{ hintText }}</span>
    </label>
    <input type="file" id="file-input" ref="fileInput" @change="handleFileUpload" multiple style="display: none;"/>

    <!-- 显示 QtechUploadMask 组件 -->
    <ImUploadMask :visible="isUploading"
                  :progress="uploadProgress"
                  :uploaded-bytes="uploadedBytes"
                  :total-bytes="totalBytes"
                  :show-details="showUploadDetails"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { isExistAaProgram, uploadAaProgramByPutUrl } from '@/api/biz/aa/program' // 获取预签名 URL 的接口
import ImUploadMask from '@/views/biz/common/ImUploadMask.vue' // 确保路径正确

export default {
  name: 'ImFileUpload',
  components: {
    ImUploadMask
  },
  props: {
    acceptedFormats: {
      type: String,
      default: 'zip,rar,7z'
    },
    hintText: {
      type: String,
      default: '仅允许上传 zip、rar、7z 格式的压缩文件。'
    },
    showUploadDetails: {
      type: Boolean,
      default: true // 是否显示上传详情
    }
  },
  data() {
    return {
      isUploading: false,
      uploadProgress: 0,
      uploadedBytes: 0,
      totalBytes: 0
    }
  },
  methods: {
    async handleFileUpload(event) {
      const files = event.target.files
      if (files.length === 0) return

      this.isUploading = true
      this.uploadProgress = 0
      this.uploadedBytes = 0

      for (const file of Array.from(files)) {
        if (!this.isFileValid(file)) {
          this.isUploading = false // 立即结束上传
          return // 终止操作
        }

        // 检查文件是否存在
        const response = await isExistAaProgram(file.name)
        if (response.data === true) {
          this.isUploading = false // 终止上传
          this.$message.error(`程序 ${file.name.split('.')[0]} 已存在，请勿重复上传`)
          return // 继续处理下一个文件
        }

        try {
          // 获取预签名的上传 URL
          const response = await uploadAaProgramByPutUrl(file.name)
          const putUrl = response.data // 获取到预签名 URL

          // 使用 axios 上传文件到预签名 URL
          await axios.put(putUrl, file, {
            headers: {
              'Content-Type': file.type
            },
            onUploadProgress: (progressEvent) => {
              // 更新已上传字节数和总字节数
              this.uploadedBytes = progressEvent.loaded
              this.totalBytes = progressEvent.total
              this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            }
          })

          // 上传成功
          this.$emit('upload-success', file)
          this.$message.success(`文件 ${file.name} 上传成功`)

          // 框架有全局的异常处理，这里就不再处理了
          // } catch (error) {
          //   // 上传失败
          //   this.$message.error(`文件 ${file.name} 上传失败: ${error.message}`);
        } finally {
          this.isUploading = false
          this.uploadProgress = 0
        }
      }
    },

    isFileValid(file) {
      const acceptedTypes = this.acceptedFormats.split(',')
      const fileExtension = file.name.split('.').pop().toLowerCase()

      // 校验文件扩展名
      if (!acceptedTypes.includes(fileExtension)) {
        this.$message.error(`不支持的文件类型: ${file.name}`)
        return false
      }

      const fileNameParts = file.name.split('.')
      const baseName = fileNameParts.slice(0, -1).join('.') // 获取不带扩展名的文件名
      const versionPattern = /_V(\d+)$/ // 匹配 "_V" 和数字的正则表达式

      // 校验文件名的前缀、版本号和扩展名
      if (baseName.charAt(0) !== baseName.charAt(0).toUpperCase()) {
        this.$message.error(`文件名的前缀必须大写: ${file.name}`)
        return false
      }

      if (!versionPattern.test(baseName)) {
        this.$message.error(`文件名须符合规范，格式参考 "XXXX_V<版本号>.zip"，当前文件名为: ${file.name}`)
        return false
      }

      // 检查版本号
      const versionMatch = baseName.match(versionPattern)
      if (versionMatch) {
        const version = versionMatch[1]
        if (!/^\d+$/.test(version)) {
          this.$message.error(`版本号必须为数字: ${file.name}`)
          return false
        }
      }
      return true // 文件名有效
    },

    triggerFileUpload() {
      this.$refs.fileInput.click()
    }
  }
}
</script>

<style scoped>
.upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.upload-area {
  width: 100%;
  height: 60px;
  border: 2px dashed #d9d9d9;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #fafafa;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.upload-area:hover {
  background-color: #eef3f8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.icon-upload {
  font-size: 24px;
  margin-right: 10px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin-right: auto;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.upload-link {
  color: #409EFF;
  text-decoration: underline;
  cursor: pointer;
}

.upload-link:hover {
  color: #66b1ff;
}

</style>
