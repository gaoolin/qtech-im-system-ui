<template>
  <div class="app-container">
    <el-card v-show="showSearch">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px" :rule="rules">
        <el-form-item label="机型" prop="prodType">
          <el-input
            v-model="queryParams.prodType"
            placeholder="请输入机型"
            clearable
            @keyup.enter.native="handleQuery"
            @input="getList"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option
              v-for="dict in dict.type.aa_program_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
              @change="getList"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="时间" prop="dtRange">
          <el-date-picker
            v-model="queryParams.dtRange"
            style="width: 340px"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 上传组件区域 -->
    <template v-if="checkPermi(['aa:program:upload'])">
      <QtechFileUpload
        :accepted-formats="'zip,rar,7z'"
        hint-text="仅允许上传 zip、rar、7z 格式的压缩文件。"
        :show-upload-details="true"
        @upload-success="onUploadSuccess"
      />
    </template>
    <template v-else>
      <div class="upload-placeholder">
        程序上传需联系对应人员，或开通权限
      </div>
    </template>
    <el-card>
      <el-table :header-cell-style="headerCellStyle()"
                :cell-style="bodyCellStyle()"
                :style="tableStyle()" :data="fileList"
                border
                v-loading="loading" :highlight-current-row="true"
                @selection-change="handleSelectionChange"
      >
        <el-table-column type="index" label="序号" width="55" align="center" fixed></el-table-column>
        <el-table-column prop="prodType" label="适用机型" min-width="180"></el-table-column>
        <el-table-column prop="fileName" label="文件名" min-width="180"></el-table-column>
        <el-table-column prop="version" label="版本" width="120"></el-table-column>
        <el-table-column prop="createTime" label="上传日期" min-width="180"></el-table-column>
        <el-table-column prop="size" label="程序大小" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.aa_program_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column prop="downloadCnt" label="下载次数" width="120"></el-table-column>
        <el-table-column prop="createBy" label="提供人" width="150"></el-table-column>
        <el-table-column prop="factoryName" label="厂区" width="150"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip></el-table-column>

        <!-- 原生按钮实现 -->
        <el-table-column :label="'操作'" fixed="right" :width="checkRole(['aaProgram:admin']) ? 240 : 170">
          <template slot-scope="scope">
            <div class="operation-buttons">
              <button class="btn primary" @click="handleDownload(scope.row)">下载</button>
              <button class="btn warning" @click="handleEdit(scope.row)">修改信息</button>
              <button class="btn danger" @click="handleDelete(scope.row)" v-if="checkRole(['aaProgram:admin'])">删除</button>
            </div>
          </template>
        </el-table-column>


      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <el-dialog title="修改程序信息" :visible.sync="editDialogVisible" width="500px" append-to-body>
      <el-form :model="editForm">
        <el-form-item label="适用机型">
          <el-input v-model="editForm.prodType"  :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="文件名">
          <el-input v-model="editForm.fileName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="editForm.version" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="文件大小">
          <el-input v-model="editForm.size" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="上传日期">
          <el-input v-model="editForm.createTime" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="厂区" v-model="editForm.factoryName">
          <el-input v-model="editForm.factoryName"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio
              v-for="dict in dict.type.aa_program_status"
              :key="dict.value"
              :label="dict.value"
            >{{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" placeholder="请输入备注"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定</el-button>
      </div>
    </el-dialog>
    <!--    <el-progress v-if="uploadData.uploadProgress" :percentage="uploadData.uploadProgress"></el-progress>-->
  </div>
</template>

<script>
import { pickerOptionsSet3 } from '@/views/biz/common/js/pickerOptionsConfig'
import { bodyCellStyle, headerCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles'
import { formatFileSize } from '@/views/biz/common/js/utils'
import { addAaProgramInfo, editAaProgramInfo, deleteAaProgram, downloadAaProgramByGetUrl, listAaProgramInfo } from '@/api/biz/aa/program'
import RightToolBarGoBack from '@/views/biz/common/RightToolBarGoBack'
import QtechFileUpload from '@/views/biz/common/ImFileUpload.vue'
import { checkPermi, checkRole } from "@/utils/permission"; // 权限判断函数

export default {
  dicts: ['aa_program_status'],
  components: {
    QtechFileUpload
  },
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      back: false,
      // 总条数
      total: 0,
      loading: false,
      fileList: null,
      pickerOptions: pickerOptionsSet3,
      // 厂选择器
      factoryOptions: [],
      // 区选择器
      workshopOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        prodType: null,
        status: null,
        dtRange: []
      },
      rules: {},
      editDialogVisible: false,
      editForm: {
        id: null,
        prodType: null,
        fileName: null,
        factoryName: null,
        status: null,
        remark: null
      },
      selectedFiles: []
    }
  },
  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,
    checkRole,
    checkPermi,

    getList() {
      this.loading = true;
      this.queryParams.params = {};
      const parseDate = (dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.error('Invalid date:', dateStr);
          return null;
        }
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
      };

      if (this.queryParams.dtRange && this.queryParams.dtRange.length === 2) {
        const beginDate = this.queryParams.dtRange[0];
        const endDate = this.queryParams.dtRange[1];

        if (beginDate && endDate) {

          this.queryParams.params['beginDate'] = parseDate(beginDate);
          this.queryParams.params['endDate'] = parseDate(endDate);
        }
      }

      listAaProgramInfo(this.queryParams).then(res => {
        // 遍历 res.rows，将 eq 属性转换为字符串类型
        this.fileList = res.rows.map(item => {
          return {
            ...item,
            status: item.status != null ? item.status.toString() : null // 转换为字符串
          };
        });
        this.total = res.total;
        this.loading = false;
      });
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

    /** 重置按钮操作 */
    restQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    handleDownload(row) {
      const fileName = row.fileName
      // 请求后端生成预签名 URL
      downloadAaProgramByGetUrl(fileName).then(response => {
        const getUrl = response.data // 假设响应中包含预签名 URL
        // 创建一个临时的 <a> 标签来触发下载
        const link = document.createElement('a')
        link.href = getUrl
        link.setAttribute('download', fileName) // 设置文件名（可选）
        document.body.appendChild(link)
        // 触发点击事件，浏览器将开始下载并显示进度
        link.click()
        document.body.removeChild(link)
      }).catch(error => {
        console.error('预签名 URL 生成失败:', error)
      })
    },

    beforeUpload(file) {
    },

    onUploadSuccess(response) {
      const fileName = response.name  // 获取文件名
      const modifiedDate = new Date(response.lastModifiedDate)
      // 使用 Intl.DateTimeFormat 来格式化为东八区（Asia/Shanghai）
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Shanghai'
      }
      const formattedDate = new Intl.DateTimeFormat('zh-CN', options).format(modifiedDate).replace(/\//g, '-')
      const fileSize = formatFileSize(response.size)
      addAaProgramInfo({
        fileName: fileName,  // 确保传递的 fileName 是有值的
        size: fileSize,  // 文件大小
        createTime: formattedDate // 文件创建时间
      })
      this.getList() // 上传成功后重新获取文件列表
    },

    handleUploadError(err, file, fileList) {
      // 处理上传失败
    },

    handleEdit(row) {
      this.editForm = { ...row }
      this.editDialogVisible = true
    },

    handleDelete(row) {
      // 调用后端接口删除文件
      const fileName = row.fileName
      const id = row.id
      deleteAaProgram(fileName, id)
        .then(response => {
          this.$message.success('文件删除成功')
          this.getList() // 删除成功后重新获取文件列表
        })
    },

    submitEdit() {
      // 调用后端接口提交修改
      editAaProgramInfo(this.editForm)
        .then(response => {
          this.editDialogVisible = false
          this.getList() // 修改成功后重新获取文件列表
        })
    },

    handleSelectionChange(selection) {
      this.selectedFiles = selection
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.getList()
    },

    triggerFileUpload() {
      // 触发文件选择框
      this.$refs.fileInput.click()
    }

  },
  created() {
  },

  mounted() {
    this.getList()
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-table {
  margin-top: 5px;
}

::v-deep .el-form-item {
  margin-top: 5px;
  margin-bottom: 5px !important;
}

.upload-placeholder {

  text-align: center; /* 文字居中 */
  color: #999; /* 文字颜色 */
  padding: 20px; /* 内边距 */
  font-size: 14px; /* 字体大小 */
  border: 1px dashed #ccc; /* 虚线边框 */
  border-radius: 4px; /* 圆角边框 */
  margin: 10px 0; /* 上下外边距 */
}

.operation-buttons {
  display: flex;
  justify-content: space-between; /* 保持按钮之间的固定间距 */
  align-items: center; /* 垂直居中 */
  gap: 10px; /* 按钮之间的间距 */
  white-space: nowrap; /* 防止按钮换行 */
  width: 100%; /* 使列宽度自适应按钮的宽度 */
}

.btn {
  padding: 5px 15px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s;
  white-space: nowrap; /* 确保按钮文本不换行 */
}

.btn.primary {
  background-color: #409eff;
  color: white;
}

.btn.warning {
  background-color: #e6a23c;
  color: white;
}

.btn.danger {
  background-color: #f56c6c;
  color: white;
}

.btn:hover {
  opacity: 0.8;
}

</style>
