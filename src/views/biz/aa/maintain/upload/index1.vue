<template>
  <div class="app-container">
    <el-tabs v-model="activeTab">

      <el-tab-pane label="在线模版" name="online">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px" :rule="rules">
          <el-form-item label="机型" prop="prodType">
            <el-input
              v-model="queryParams.prodType"
              placeholder="请输入机型"
              clearable
              @change="dataChange"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="盒子号" prop="simId">
            <el-input
              v-model="queryParams.simId"
              placeholder="请输入盒子号"
              clearable
              @change="dataChange"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item label="时段" prop="dtRange">
            <date-time-range-picker
              v-model="queryParams.dtRange"
              label="时段"
              prop="dtRange"
              :max-span-value="30"
              :max-span-unit="'minute'"
              :required="true"
              :enable-shortcuts="false"
            ></date-time-range-picker>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 数据表格 -->
        <el-table v-loading="loading" :data="resultList" :key="refreshKey" border
                  :header-cell-style="tableHeaderCellStyle"
        >
          <el-table-column type="index" label="序号" width="55" align="center" fixed/>

          <!-- 产品信息 -->
          <el-table-column label="机型相关" align="left" width="160">
            <template slot-scope="scope">
              <div class="prop-container">
                  <span class="prop-label">
                    <div>
                      机型:
                    </div>
                    <div>
                      {{ convertNull(scope.row.prodType) }}
                    </div>
                  </span>
              </div>
              <div class="prop-container">
                  <span class="prop-label">
                    <div>
                      盒子号:
                    </div>
                    <div>
                      {{ convertNull(scope.row.simId) }}
                    </div>
                  </span>
              </div>
              <div class="prop-container">
                  <span class="prop-label">
                    <div>
                      接收时间:
                    </div>
                    <div>
                      {{ convertNull(scope.row.receivedTime) }}
                    </div>
                  </span>
              </div>
            </template>
          </el-table-column>

          <!-- 初始化和重置 -->
          <el-table-column label="初始化和重置" align="left">
            <template slot-scope="scope">
              <div class="prop-container">
              <span class="prop-label">
                init:
                <span class="prop-value"
                      :class="{'enabled': convertNull(scope.row.init) === 'Enable', 'disabled': convertNull(scope.row.init) === 'Disable'}"
                >{{ convertNull(scope.row.init) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                reInit:
                <span class="prop-value"
                      :class="{'enabled': convertNull(scope.row.reInit) === 'Enable', 'disabled': convertNull(scope.row.reInit) === 'Disable'}"
                >{{ convertNull(scope.row.reInit) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                senserReset:
                <span class="prop-value"
                      :class="{'enabled': convertNull(scope.row.senserReset) === 'Enable', 'disabled': convertNull(scope.row.senserReset) === 'Disable'}"
                >{{ convertNull(scope.row.senserReset) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                clampOnOff:
                <span class="prop-value"
                      :class="{'enabled': convertNull(scope.row.clampOnOff) === 'Enable', 'disabled': convertNull(scope.row.clampOnOff) === 'Disable'}"
                >{{ convertNull(scope.row.clampOnOff) }}</span>
              </span>
              </div>
              <div class="prop-container">
              <span class="prop-label">
                sid:
                <span class="prop-value"
                      :class="{'enabled': convertNull(scope.row.sid) === 'Enable', 'disabled': convertNull(scope.row.sid) === 'Disable'}"
                >{{ convertNull(scope.row.sid) }}</span>
              </span>
              </div>
            </template>
          </el-table-column>
          ...
          <!-- 操作 -->
          <el-table-column prop="option" label="操作" align="center" width="100" fixed="right">
            <template slot-scope="scope">
              <div class="btn-ops-cell">
                <el-button size="mini" type="text" class="btn-ops" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button size="mini" type="text" class="btn-ops" @click="handleUpload(scope.row)">设置为标准模版</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          :page-sizes="[1, 2, 5, 10, 50]"
          @pagination="getList"
        />

        <!-- 编辑模态框 -->
        <el-dialog :visible.sync="editDialogVisible" :width="'30%'" append-to-body title="编辑标准List参数模版">
          <el-form ref="editFormRef" :rules="rules" label-width="180px" :model="editForm">
            <el-form-item label="机型" prop="prodType">
              <el-input v-model="editForm.prodType" :disabled="true"/>
            </el-form-item>
            <el-collapse v-model="outerActiveNames" accordion>
              <el-collapse-item class="main-item" title="初始化和重置" name="1">
                <el-form-item label="init" prop="init">
                  <el-select v-model="editForm.init" placeholder="请选择" clearable @clear="handleClear('init')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label"
                               :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="reInit" prop="reInit">
                  <el-select v-model="editForm.reInit" placeholder="请选择" clearable @clear="handleClear('reInit')">
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label"
                               :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="senserReset" prop="senserReset">
                  <el-select v-model="editForm.senserReset" placeholder="请选择" clearable
                             @clear="handleClear('senserReset')"
                  >
                    <el-option v-for="dict in dict.type.aa_list_params_power" :key="dict.value" :label="dict.label"
                               :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>

          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">提交</el-button>
          </div>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { getAaParamsParsed, updateAaParamsModelInfo } from '@/api/biz/aa/params'
import { checkPermi, checkRole } from '@/utils/permission'
import DateTimeRangePicker from '@/views/biz/common/DateTimeRangePicker.vue'
import { convertNull, formatDt } from '@/views/biz/common/js/utils'

export default {
  name: 'index',
  dicts: ['aa_list_params_power'],
  components: {
    DateTimeRangePicker
  },

  data() {
    return {
      fileList: [],
      tableData: [],
      fileSelected: false,
      // 上传参数
      upload: {
        // 是否禁用上传
        isUploading: false,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/aa/params/model/detail/upload/manual',
        // 上传的文件列表
        fileList: []
      },

      activeTab: 'online',
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 参数表格数据
      resultList: [],
      list: [],
      // 弹出层标题
      title: '',
      // 刷新标识
      refreshKey: 0,
      // 是否显示弹出层
      editDialogVisible: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 1,
        prodType: null,
        simId: null,
        dtRange: [null, null]
      },
      // 表单参数
      editForm: {},
      results: Array.from({ length: 52 }, (_, i) => `result${i + 1}`),
      // 表单校验
      rules: {
        prodType: [{ required: true, message: '机型不能为空', trigger: 'blur' }],
        init: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        reInit: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        senserReset: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        clampOnOff: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        sid: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        AA1: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        AA2: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        AA3: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        mtfCheck: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        mtfCheck2: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        mtfCheck3: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpOn: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpOff: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpOc: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpOcCheck: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpOnBlemish: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        lpBlemish: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        blemish: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        chartAlignment: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        chartAlignment1: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        chartAlignment2: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmHall: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmHall2: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmPowerOff: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmPowerOn: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmTop: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmTopHall: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmZ: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmZHall: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmOisInit: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmMoveToZ: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmPowerOffCheck: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmMoveToZPos: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        vcmInit: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        mtfOffAxisCheck1: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        mtfOffAxisCheck2: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        mtfOffAxisCheck3: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        openCheck: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        backToPosition: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        delay: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        destroy: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        destroyStart: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        dispense: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        epoxyInspectionAuto: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        epoxyInspection: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        grab: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        gripperOpen: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        moveToBlemishPos: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        recordPosition: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        saveOc: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        saveMtf: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        uvon: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        uvoff: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        yLevel: [{ validator: this.checkParamsRule, trigger: 'blur' }],
        resultCheckMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        resultCheckMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        epoxyInspectionInterval: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        xResMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        xResMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        yResMin: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        yResMax: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        roiCc: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        roiUl: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        roiUr: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        roiLr: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        roiLl: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result1: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result2: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result3: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result4: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result5: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result6: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result7: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result8: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result9: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result10: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result11: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result12: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result13: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result14: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result15: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result16: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result17: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result18: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result19: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result20: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result21: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result22: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result23: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result24: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result25: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result26: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result27: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result28: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result29: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result30: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result31: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result32: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result33: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result34: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result35: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result36: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result37: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result38: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result39: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result40: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result41: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result42: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result43: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result44: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result45: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result46: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result47: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result48: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result49: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result50: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result51: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }],
        result52: [{ validator: this.checkNumericOrEmpty, trigger: 'blur' }]
      },
      outerActiveNames: ['1'], // 默认展开的外部项
      innerActiveNames: [] // 内部项默认不展开
    }
  },
  methods: {
    checkPermi,
    checkRole,
    convertNull,
    formatDt,

    uploadFail() {
      this.$modal.msgError('远程服务异常！')
    },
    handleUploadSuccess(response, file, fileList) {
      // Handle the response from the server
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert('<div style="overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;">' + response.msg + '</div>', '导入结果', { dangerouslyUseHTMLString: true })
    },
    handlePreview(file) {
      console.log('preview', file)
    },
    handleRemove(file, fileList) {
      console.log('remove', file, fileList)
      this.fileSelected = false // Reset fileSelected if the file is removed
    },
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      if (!isExcel) {
        this.$message.error('上传文件只能是 Excel 格式!')
      }
      return isExcel
    },
    handleFileChange(file, fileList) {
      this.fileSelected = fileList.length > 0
    },
    importTemplate() {
      this.download('/aa/params/model/detail/importTemplate', {}, 'AA List参数标准模版.xlsx')
    },
    submitData() {
      this.$refs.upload.submit()
    },
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传返回后台信息
    handleResponse(response, file, fileList) {
      this.upload.isUploading = false
      if (response.code !== 200) {
        this.$modal.msgError(response.msg)
      } else {
        this.$modal.msgSuccess(response.msg)
      }
    },

    // tab-2
    getList() {
      if (this.activeTab === 'online') {
        this.$refs.queryForm.validate(valid => {
          if (valid) {
            this.loading = true
            this.queryParams.params = {
              beginDate: this.formatDt(this.queryParams.dtRange[0]),
              endDate: this.formatDt(this.queryParams.dtRange[1])
            }
            getAaParamsParsed(this.queryParams).then(response => {
              this.resultList = response.rows
              this.total = response.total
              this.loading = false
            })
          }
        })
      }
    },

    dataChange() {
      this.getList()
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 修改按钮操作 */
    handleEdit(row) {
      this.editForm = { ...row }
      // if (checkPermi('aa:params:model:upload')) {
      // }
      this.editDialogVisible = true
      this.title = '修改List参数模版信息'
    },

    handleUpload(row) {
      this.loading = true
    },

    // 取消按钮
    cancel() {
      this.editDialogVisible = false
      this.reset()
    },

    // 表单重置
    reset() {
      this.editForm = {
        id: null

      }
      this.resetForm('editForm')
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['editFormRef'].validate(valid => {
        if (valid) {
          updateAaParamsModelInfo(this.editForm).then(response => {
            this.$modal.msgSuccess('修改成功')
            this.editDialogVisible = false
            this.getList()
          })
        }
      })
    },

    tableHeaderCellStyle({ row, column, rowIndex, columnIndex }) {
      return 'font-size: 14px; font-weight: bolder; align-items: center; text-align: center;'
    },

    /** 字段校验规则 */
    checkParamsRule(rule, value, callback) {
      if (!value) {
        // 如果值为空，则校验通过（视为可选）
        callback()
      }
      const allowedTypes = ['Enable', 'Disable', '']
      if (allowedTypes.includes(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的参数值, 必须是Enable、Disable或空值'))
      }
    },
    checkNumericOrEmpty(rule, value, callback) {
      const numericPattern = /^-?\d+(\.\d+)?$/
      if (!value) {
        callback()
      } else if (numericPattern.test(value)) {
        callback()
      } else {
        callback(new Error('请输入数字或留空'))
      }
    },

    handleClear(field) {
      this.$set(this.editForm, field, null)
    },

    handleInputChange(field) {
      if (this.editForm[field] === '') {
        this.$set(this.editForm, field, null)
      }
    }
  },

  mounted() {
    if (this.activeTab === 'online') {
      this.getList()
    }
  },

  created() {
    const now = new Date()
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
    this.queryParams.dtRange = [thirtyMinutesAgo, now]
  }
}


</script>

<style scoped>
.import-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.upload-demo {
  border: 2px dashed #d9d9d9;
  background-color: #fff;
  border-radius: 6px;
  text-align: center;
  padding: 20px;
}

.el-upload__text {
  font-size: 16px;
  color: #606266;
}

.el-upload__tip {
  color: #909399;
}

.el-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
}

.el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}

.el-table td,
.el-table th {
  text-align: center;
}

.card-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

/*online部分*/
::v-deep .el-collapse-item__header {
  font-size: 16px; /* 调整字体大小 */
  font-weight: bold; /* 调整字体粗细 */
  color: #333; /* 调整字体颜色 */
}

::v-deep .el-collapse-item.main-item .el-collapse-item__header {
  font-size: 18px; /* 主项字体大小 */
  font-weight: bold; /* 主项字体粗细 */
  color: #1f2d3d; /* 主项字体颜色 */
}

::v-deep .el-collapse-item.sub-item .el-collapse-item__header {
  font-size: 16px; /* 子项字体大小 */
  font-weight: normal; /* 子项字体粗细 */
  color: #409eff; /* 子项字体颜色 */
}

.rotated-col {
  writing-mode: vertical-rl;
  text-align: left;
  transform: rotate(-0deg);
  transform-origin: left top;
  white-space: nowrap;
  margin-top: 10px; /* 根据需要调整 */
  margin-bottom: 10px; /* 根据需要调整 */
}


.prop-container {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.prop-label {
  font-weight: bold;
  margin-right: 5px;
}

.prop-separator {
  margin-right: 5px;
}

.prop-value {
  display: inline-block;
}

.prop-value.enabled {
  color: green;
}

.prop-value.disabled {
  color: red;
}

/* 覆盖特定列的 cell 样式 */
::v-deep td.el-table_1_column_9.is-center.el-table__cell > div.cell {
  padding: 0 !important; /* 覆盖 padding */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.btn-ops-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%; /* 确保 div 高度为 100% */
}

/* 按钮的样式 */
.btn-ops {
  width: 100%;
  text-align: center;
  margin: 5px 0;
}
</style>
