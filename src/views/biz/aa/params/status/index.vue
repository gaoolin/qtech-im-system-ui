<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryParams" ref="queryForm" :label-width="formLabelWidth" v-show="showSearch">
      <el-form-item label="厂区" prop="factoryName">
        <el-select
          v-model="queryParams.factoryName"
          placeholder="请输入厂区名称"
          filterable
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="item in factoryOptions"
            :key="item.key"
            :label="item.label"
            :value="item.label"
            :disabled="item.disabled"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select
          v-model="queryParams.groupName"
          placeholder="请输入车间名称"
          filterable
          clearable
          @focus="getGroupNames"
          @change="handleQuery"
        >
          <el-option
            v-for="item in groupNameOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备编号" prop="eqId">
        <el-input
          v-model="queryParams.eqId"
          placeholder="请输入设备编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机台号" prop="mcId">
        <el-input
          v-model="queryParams.mcId"
          placeholder="请输入机台编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="盒子号" prop="simId">
        <el-input
          v-model="queryParams.simId"
          placeholder="请输入盒子号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机型" prop="prodType">
        <el-input
          v-model="queryParams.prodType"
          placeholder="请输入机型"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          size="small"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in dict.type.aa_list_params_ignore_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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

    <el-table v-loading="loading" :data="tableData"
              :header-cell-style="headerCellStyle()"
              :cell-style="bodyCellStyle()"
              :style="tableStyle()"
              border stripe
              style="width: 100%">
      <el-table-column label="厂区" align="center" prop="factoryName"/>
      <el-table-column label="车间" align="center" prop="groupName"/>
      <el-table-column label="设备编号" align="center" prop="eqId" min-width="100"/>
      <el-table-column label="机台编号" align="center" prop="mcId"/>
      <el-table-column label="盒子号" align="center" prop="simId" min-width="100"/>
      <el-table-column align="center" prop="prodType">
        <template slot-scope="scope" slot="header">
          <span>机型</span>
          <el-tooltip class="item" effect="dark" placement="top-start" content="超过7天没有点检数据的机台不显示机型">
            <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="status">
        <template slot-scope="scope" slot="header">
          <span>状态</span>
          <el-tooltip class="item" effect="dark" placement="top-start" content="切换按钮为绿色时，机台为受控状态;切换按钮为红色时，机台为放行状态">
            <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.statusComputed"
            :active-value="0"
            :inactive-value="1"
            :active-text="scope.row.statusComputed === 1 ? '放行' : '受控'"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="changeSwitch(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作次数" align="center" prop="opCnt"/>
      <el-table-column label="上次操作时间" align="center" prop="updateTime" width="180"/>
      <el-table-column label="操作人" align="center" prop="updateBy" width="180"/>
      <el-table-column label="备注" align="center" prop="remark"/>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { headerCellStyle, bodyCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles';
import { listAaEquipmentInfo, updateAaEqReverseStat, getFactoryNames, getGroupNames } from '@/api/biz/aa/params'

export default {
  name: 'index',
  dicts: ['aa_list_params_ignore_status'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 列表
      tableData: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      showSearch: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        eqId: null,
        mcId: null,
        simId: null,
        prodType: null,
        status: null,
        remark: null
      },
      formLabelWidth: '68px',
      factoryOptions: [],
      groupNameOptions: [],
    }
  },

  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,

    /** 查询列表 */
    getList() {
      this.loading = true
      listAaEquipmentInfo(this.queryParams).then(response => {
        this.tableData = response.rows
        this.total = response.total
        this.loading = false
      })
    },

    getFactoryNames() {
      this.factoryOptions = []
      getFactoryNames().then(response => {
        for (const i in response.data) {
          let o = {}
          const tmp = response.data[i]['factoryName']
          o.label = tmp
          if (tmp === '汉浦厂区' || tmp === 'QT_India') {
            o.disabled = false
            this.factoryOptions.push(o)
          } else {
            this.factoryOptions.push(o)
          }
        }
      })
    },

    getGroupNames() {
      this.groupNameOptions = []
      getGroupNames(this.queryParams).then(response => {
        for (const i in response.data) {
          this.groupNameOptions.push(response.data[i]['workshopName'])
        }
      })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleUpdate() {
      this.getList()
    },
    /** 导出 */
    handleExport() {
      this.download('/aa/params/eq/export', {
        ...this.queryParams
      }, `AA-List管控设备状态_${new Date().getTime()}.xlsx`)
    },

    statusFormat(row, column) {
      return this.selectDictLabel(this.dict.type.aa_list_params_ignore_status, row.status)
    },
    dataChange(data) {
      for (let item in this.columns) {
        const key = this.columns[item].key
        this.columns[item].visible = !data.includes(key)
      }
    },

    /** 修改模版状态 */
    changeSwitch(row) {
      this.queryParams.simId = row.simId
      this.queryParams.status = row.statusComputed
      updateAaEqReverseStat(this.queryParams).then(response => {
        if (response.code === 200) {
          this.$modal.msgSuccess('修改成功！')
          this.resetQuery()
        } else {
          this.$modal.msgError('返回状态码异常，请检查！')
        }
      }).catch(() => {
      })
    },

    initializeStatus() {
      this.tableData.forEach(row => {
        row.statusComputed = row.status === null ? 0 : row.status;
      });
    },


  },

  created() {
    this.getList()
    this.getFactoryNames()
    this.initializeStatus()
  },

  watch: {
    'tableData': {
      deep: true,
      handler(tableData) {
        this.initializeStatus();
      }
    }
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
</style>
