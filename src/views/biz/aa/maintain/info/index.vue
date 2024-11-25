<template>
  <div class="app-container center">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="机型" prop="prodType">
        <el-input
          v-model="queryParams.prodType"
          placeholder="请输入机型"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"/>
    </el-row>

    <template>
      <el-table
        v-loading="loading" :data="list"
        :header-cell-style="headerCellStyle()"
        :cell-style="bodyCellStyle()"
        :style="tableStyle()"
        border>
        <el-table-column label="序号" type="index" align="center" width="60"/>
        <el-table-column label="机型" align="center" prop="prodType"/>
        <el-table-column label="list参数个数" align="center" prop="listParams"/>
        <el-table-column label="item参数个数" align="center" prop="itemParams"/>
        <el-table-column label="状态" align="center" prop="status">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="changeSwitch(scope.row.id, scope.row.status)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="提供人" align="center" prop="provider"/>
        <el-table-column label="归属" align="center" prop="belongTo"/>
        <el-table-column label="创建人" align="center" prop="createBy"/>
        <el-table-column label="创建时间" align="center" width="180" prop="createTime">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新人" align="center" prop="updateBy"/>
        <el-table-column label="更新时间" align="center" width="180" prop="updateTime">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark"/>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
            >修改
            </el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >删除
            </el-button>
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

      <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="机型" prop="prodType">
            <el-input v-model="form.prodType" placeholder="请输入机型" :disabled="true"/>
          </el-form-item>
          <el-form-item label="list参数数" prop="listParams">
            <el-input v-model="form.listParams" placeholder="请输入list参数数"/>
          </el-form-item>
          <el-form-item label="item参数数" prop="itemParams">
            <el-input v-model="form.itemParams" placeholder="请输入item参数数"/>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="提供人" prop="provider">
            <el-input v-model="form.provider" placeholder="请输入提供人"/>
          </el-form-item>
          <el-form-item label="归属" prop="belongTo">
            <el-input v-model="form.belongTo" placeholder="请输入归属"/>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" placeholder="请输入备注"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
    </template>
  </div>
</template>

<script>
import { headerCellStyle, bodyCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles';
import { deleteAaParamsModelInfo, getAaParamsModelInfo, updateAaParamsModelInfo } from '@/api/biz/aa/maintain/models'
export default {
  name: 'index.vue',
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 参数表格数据
      list: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      ids: [],
      prodTypes: [],
      single: true,
      multiple: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        prodType: null,
        listParams: null,
        itemParams: null,
        status: null,
        provider: null,
        belongTo: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    }
  },

  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,

    /** 查询参数列表 */
    getList() {
      this.loading = true
      getAaParamsModelInfo(this.queryParams).then(response => {
        this.list = response.rows
        this.total = response.total
        this.loading = false
      })
    },

    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    handleExport() {
      this.download('/aa/params/model/info/export', {
        ...this.queryParams
      }, `AA-List参数模版信息_${new Date().getTime()}.xlsx`)
    },

    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },

    /** 修改模版状态 */
    changeSwitch(id, status) {
      updateAaParamsModelInfo({ id: id, status: status }).then(response => {
        if (response.code === 200) {
          this.getList()
          this.$modal.msgSuccess('修改成功！')
        } else {
          this.$modal.msgError('返回状态码异常，请检查！')
        }
      }).catch(() => {
      })
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      getAaParamsModelInfo({ id: row.id }).then(response => {
        this.form = response.rows[0]
        this.open = true
        this.title = '修改List参数模版信息'
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },

    // 表单重置
    reset() {
      this.form = {
        id: null,
        prodType: null,
        listParams: null,
        itemParams: null,
        status: null,
        provider: null,
        belongTo: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      }
      this.resetForm('form')
    },

    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          updateAaParamsModelInfo(this.form).then(response => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
          })
        }
      })
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.prodTypes = selection.map(item => item.prodType)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      const prodTypes = row.prodType || this.prodTypes
      this.$modal.confirm('是否确认删除机型为"' + prodTypes + '"的List参数模版？').then(function() {
        return deleteAaParamsModelInfo(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    }
  },

  created() {
    this.getList()
  },

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
</style>

