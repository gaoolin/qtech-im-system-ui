<template>
  <div class="app-container center">
    <el-row>
      <div v-hasPermi="['fixture:search:upload']">
        <h2 class="body">治具共用信息数据上传</h2>
        <el-upload
          ref="upload"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="upload.headers"
          :action="upload.url"
          :disabled="upload.isUploading"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess"
          :auto-upload="false"
          drag
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip text-center" slot="tip">
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                     @click="importTemplate"
            >下载模板
            </el-link>
          </div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitUpload" > 上 传 服 务 器</el-button>
        </div>
      </div>
    </el-row>

    <el-row :gutter="20" class="mb8">
      <div class="upload-div">
        <div class="div" v-hasPermi="['fixture:control:pogopin:upload']">
          <h2 class="body">PogoPin治具因子数据上传</h2>
          <el-upload
            ref="UploadParamsPogopin"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="UploadParamsPogopin.headers"
            :action="UploadParamsPogopin.url"
            :disabled="UploadParamsPogopin.isUploading"
            :on-progress="handleFileUploadProgressParamsPoGoPin"
            :on-success="handleFileSuccessParamsPoGoPin"
            :auto-upload="false"
            drag
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip text-center" slot="tip">
              <span>仅允许导入xls、xlsx格式文件。</span>
              <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                       @click="importTemplateParamsPoGoPin"
              >下载模板
              </el-link>
            </div>
          </el-upload>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitUploadParamsPoGoPin" >
              上 传 服 务 器
            </el-button>
          </div>
        </div>

        <div class="div" v-hasPermi="['fixture:control:aa:upload']">
          <h2 class="body">AA治具因子数据上传</h2>
          <el-upload
            ref="UploadParamsAa"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="UploadParamsAa.headers"
            :action="UploadParamsAa.url"
            :disabled="UploadParamsAa.isUploading"
            :on-progress="handleFileUploadProgressParamsAa"
            :on-success="handleFileSuccessParamsAa"
            :auto-upload="false"
            drag
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip text-center" slot="tip">
              <span>仅允许导入xls、xlsx格式文件。</span>
              <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                       @click="importTemplateParamsAa"
              >下载模板
              </el-link>
            </div>
          </el-upload>
          <div slot="footer" class="dialog-footer" >
            <el-button type="primary" @click="submitUploadParamsAa"> 上 传
              服 务 器
            </el-button>
          </div>
        </div>

        <div class="div" v-hasPermi="['fixture:control:Lock:upload']">
          <h2 class="body">锁附治具因子数据上传</h2>
          <el-upload
            ref="UploadParamsLock"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="UploadParamsLock.headers"
            :action="UploadParamsLock.url"
            :disabled="UploadParamsLock.isUploading"
            :on-progress="handleFileUploadProgressParamsLock"
            :on-success="handleFileSuccessParamsLock"
            :auto-upload="false"
            drag
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip text-center" slot="tip">
              <span>仅允许导入xls、xlsx格式文件。</span>
              <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                       @click="importTemplateParamsLock"
              >下载模板
              </el-link>
            </div>
          </el-upload>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitUploadParamsLock">
              上 传 服 务 器
            </el-button>
          </div>
        </div>
      </div>
    </el-row>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  name: 'index',
  data() {
    return {
      // 上传参数
      upload: {
        // 是否禁用上传
        isUploading: false,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/fixture/search/upload',
        // 上传的文件列表
        fileList: []
      },
      UploadParamsPogopin: {
        isUploading: false,
        headers: { Authorization: 'Bearer ' + getToken() },
        url: process.env.VUE_APP_BASE_API + '/fixture/params/pogopin/upload',
        fileList: []
      },
      UploadParamsAa: {
        isUploading: false,
        headers: { Authorization: 'Bearer ' + getToken() },
        url: process.env.VUE_APP_BASE_API + '/fixture/params/aa/upload',
        fileList: []
      },
      UploadParamsLock: {
        isUploading: false,
        headers: { Authorization: 'Bearer ' + getToken() },
        url: process.env.VUE_APP_BASE_API + '/fixture/params/lock/upload',
        fileList: []
      }
    }
  },
  methods: {
    uploadFail() {
      this.$modal.msgError('远程服务异常！')
    },

    // 文件提交处理
    submitUpload() {
      this.$refs.upload.submit()
    },
    submitUploadParamsPoGoPin() {
      this.$refs.UploadParamsPogopin.submit()
    },
    submitUploadParamsAa() {
      this.$refs.UploadParamsAa.submit()
    },
    submitUploadParamsLock() {
      this.$refs.UploadParamsLock.submit()
    },

    /** 提交按钮 */

    /** 下载模板操作 */
    importTemplate() {
      this.download('/fixture/search/importTemplate', {}, `共治具导入模板.xlsx`)
    },
    /** 下载模板操作 */
    importTemplateParamsPoGoPin() {
      this.download('/fixture/control/pogopin/importTemplate', {}, `Pogopin因子导入模板.xlsx`)
    },
    importTemplateParamsAa() {
      this.download('/fixture/control/aa/importTemplate', {}, `AA因子导入模板.xlsx`)
    },
    importTemplateParamsLock() {
      this.download('/fixture/control/lock/importTemplate', {}, `锁附因子导入模板.xlsx`)
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    handleFileUploadProgressParamsPoGoPin(event, file, fileList) {
      this.UploadParamsPogopin.isUploading = true
    },
    handleFileUploadProgressParamsAa(event, file, fileList) {
      this.UploadParamsAa.isUploading = true
    },
    handleFileUploadProgressParamsLock(event, file, fileList) {
      this.UploadParamsLock.isUploading = true
    },

    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert('<div style=\'overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;\'>' + response.msg + '</div>', '导入结果', { dangerouslyUseHTMLString: true })
    },
    handleFileSuccessParamsPoGoPin(response, file, fileList) {
      this.UploadParamsPogopin.isUploading = false
      this.$refs.UploadParamsPogopin.clearFiles()
      this.$alert('<div style=\'overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;\'>' + response.msg + '</div>', '导入结果', { dangerouslyUseHTMLString: true })
    },
    handleFileSuccessParamsAa(response, file, fileList) {
      this.UploadParamsAa.isUploading = false
      this.$refs.UploadParamsAa.clearFiles()
      this.$alert('<div style=\'overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;\'>' + response.msg + '</div>', '导入结果', { dangerouslyUseHTMLString: true })
    },
    handleFileSuccessParamsLock(response, file, fileList) {
      this.UploadParamsLock.isUploading = false
      this.$refs.UploadParamsLock.clearFiles()
      this.$alert('<div style=\'overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;\'>' + response.msg + '</div>', '导入结果', { dangerouslyUseHTMLString: true })
    },

    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    },

    // 文件上传返回后台信息
    handleResponse(response, file, fileList) {
      this.upload.isUploading = false
      if (response.code !== 200) {
        this.$modal.msgError(response.msg)
      } else {
        this.$modal.msgSuccess(response.msg)
      }
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .el-table {
  margin-top: 5px;
}

::v-deep .el-form-item {
  margin-top: 5px;
  margin-bottom: 5px !important;
}

.center {
  text-align: center;
}

.upload-div {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.div {
  margin: 5px;
}

</style>
