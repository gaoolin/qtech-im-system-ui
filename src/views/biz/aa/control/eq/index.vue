<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="72px"
             :rulues="rules">
      <el-form-item label="厂区" prop="factoryName">
        <el-select v-model="queryParams.factoryName" placeholder="请输入厂区" clearable @change="handleFactoryChange">
          <el-option v-for="factory in factoryNameOptions" :key="factory.id" :label="factory.name" :value="factory.name"
                     :disabled="factory.disabled"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select v-model="queryParams.groupName" placeholder="请输入车间" clearable @focus="checkPreInput"
                   @change="handleQuery">
          <el-option v-for="groupName in groupNameOptions" :key="groupName.id" :label="groupName.name"
                     :value="groupName.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备编码" prop="eqId">
        <el-input v-model="queryParams.eqId" placeholder="请输入设备编码" clearable @change="handleQuery" @keyup.native="handleQuery">
        </el-input>
      </el-form-item>
      <el-form-item label="机台号" prop="mcId">
        <el-input v-model="queryParams.mcId" placeholder="请输入机台号" clearable @change="handleQuery" @keyup.native="handleQuery">
        </el-input>
      </el-form-item>
      <el-form-item label="盒子号" prop="simId">
        <el-input v-model="queryParams.simId" placeholder="请输入盒子号" clearable @change="handleQuery" @keyup.native="handleQuery">
        </el-input>
      </el-form-item>
      <el-form-item label="机型" prop="prodType">
        <el-input v-model="queryParams.prodType" placeholder="请输入机型" clearable @change="handleQuery" @keyup.native="handleQuery">
        </el-input>
      </el-form-item>
      <el-form-item label="状态" prop="statusCode">
        <el-select v-model="queryParams.statusCode" placeholder="请选择状态" clearable @change="handleQuery" @keyup.native="handleQuery">
          <el-option v-for="status in statusCodeOptions" :key="status.id" :label="status.name"
                     :value="status.id" />
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
              border stripe>
      <el-table-column label="厂区" align="center" prop="factoryName"/>
      <el-table-column label="车间" align="center" prop="groupName"/>
      <el-table-column label="设备编号" align="center" prop="eqId" min-width="100"/>
      <el-table-column label="机台编号" align="center" prop="mcId"/>
      <el-table-column label="盒子号" align="center" prop="simId" min-width="100"/>
      <el-table-column align="center" prop="prodType">
        <template slot="header">
          <span>机型</span>
          <el-tooltip class="item" effect="dark" placement="top-start" content="超过7天没有点检数据的机台不显示机型">
            <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="statusCode">
        <template slot="header">
          <span>状态</span>
          <el-tooltip class="item" effect="dark" placement="top-start" content="切换按钮为绿色时，机台为受控状态(正常状态);切换按钮为红色时，机台为放行状态(非正常状态)">
            <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.statusComputed"
            :active-value="0"
            :inactive-value="1"
            :active-text="scope.row.statusComputed === 1 ? '放行' : scope.row.statusComputed === 0 ? '受控' : '未知'"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="changeSwitch(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作次数" align="center" prop="opCnt"/>
      <el-table-column label="上次操作时间" align="center" prop="updateDt" width="180"/>
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
import { listAaEquipmentInfo, updateAaEqReverseStat } from '@/api/biz/aa/params'
import { fetchAaCtrlFactoryNames, fetchAaCtrlGroupNames } from '@/api/biz/common/factoryAndGroupNames'

export default {
  name: 'index',
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
      // 厂选择器
      factoryNameOptions: [],
      // 区选择器
      groupNameOptions: [],
      // 状态
      statusCodeOptions: [{ name: '放行', id: '1'}, { name: '受控', id: '0' }],
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
        statusCode: null,
        remark: null
      },
      formLabelWidth: '68px',
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
      this.download('/aa/control/eq/export', {
        ...this.queryParams
      }, `AA-List管控设备状态_${new Date().getTime()}.xlsx`)
    },

    /** 选取厂区列表时 */
    async handleFactoryChange() {
      if (this.queryParams.factoryName) {
        // 加载车间数据
        await this.getGroupNames()
      }
      this.queryParams.groupName = null
      this.handleQuery()
    },

    getFactoryNames() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.factoryNameOptions = []
          fetchAaCtrlFactoryNames().then(response => {
            if (!response.data || response.data.length === 0) {
              return
            }
            for (let index = 0; index < response.data.length; index++) {
              const factory = response.data[index]
              const option = {
                id: index + 1,
                name: factory['factoryName']
              }
              if (option.name === this.queryParams.factoryName) {
                // 将该项目插入到 factoryNameOptions 数组的最前面
                this.factoryNameOptions.unshift(option)
              } else {
                this.factoryNameOptions.push(option)
              }
            }
          }).catch(error => {
            console.error('获取厂区列表失败:', error)
          })
        }
      })
    },

    getGroupNames() {
      this.groupNameOptions = []
      this.checkPreInput()
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.groupNameOptions = []
          fetchAaCtrlGroupNames(this.queryParams).then(response => {
            if (!response.data || response.data.length === 0) {
              return
            }
            for (let index = 0; index < response.data.length; index++) {
              const group = response.data[index]
              const option = {
                id: index + 1,
                name: group['groupName']
              }
              if (option.name === this.queryParams.groupName) {
                // 将该项目插入到 groupNameOptions 数组的最前面
                this.groupNameOptions.unshift(option)
              } else {
                this.groupNameOptions.push(option)
              }
            }
          }).catch(error => {
            console.error('获取组名列表失败:', error)
          })
        }
      })
    },

    checkPreInput(e) {
      if (!this.queryParams.factoryName) {
        // 根据事件类型进行不同的处理
        const eventType = e && e.type ? e.type : 'unknown';
        switch (eventType) {
          case 'focus':
            // 处理 change 事件
            this.groupNameOptions = []
            break;
          default:
            // 处理其他事件类型
            break;
        }
        this.$message.error('请先选择厂区')
        return
      }
    },

    statusFormat(row, column) {
      return this.selectDictLabel(this.dict.type.aa_list_params_ignore_status, row.statusCode)
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
      this.queryParams.statusCode = row.statusComputed
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
        row.statusComputed = row.statusCode === null ? 0 : row.statusCode;
      });
    },
  },

  created() {
    this.getList()
    this.getFactoryNames()
    this.initializeStatus()
  },

  mounted() {
    this.getList()
    this.getFactoryNames();
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
