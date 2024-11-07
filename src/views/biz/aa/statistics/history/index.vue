<template>
  <div class="app-container center">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px"
      :rules="rules">
      <el-form-item label="厂区" prop="factoryName">
        <el-select v-model="queryParams.factoryName" placeholder="请输入厂区" clearable @change="handleFactoryChange">
          <el-option v-for="factory in factoryNameOptions" :key="factory.id" :label="factory.name"
            :value="factory.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select v-model="queryParams.groupName" placeholder="请输入车间" clearable @focus="checkPreInput"
          @change="handleQuery">
          <el-option v-for="groupName in groupNameOptions" :key="groupName.id" :label="groupName.name"
            :value="groupName.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备编号" prop="eqId">
        <el-input v-model="queryParams.eqId" placeholder="请输入设备编号" clearable @change="handleQuery"
          @keyup.native="handleQuery" />
      </el-form-item>
      <el-form-item label="机台号" prop="mcId">
        <el-input v-model="queryParams.mcId" placeholder="请输入机台号" clearable @change="handleQuery"
          @keyup.native="handleQuery" />
      </el-form-item>
      <el-form-item label="机型" prop="prodType">
        <el-input v-model="queryParams.prodType" placeholder="请输入机型" clearable @change="handleQuery"
          @keyup.native="handleQuery" />
      </el-form-item>
      <el-form-item label="盒子号" prop="simId">
        <el-input v-model="queryParams.simId" placeholder="请输入盒子号" clearable @change="handleQuery"
          @keyup.native="handleQuery" />
      </el-form-item>
      <el-form-item label="点检状态" prop="code">
        <el-select v-model="queryParams.code" placeholder="请输入比对结果状态" clearable @change="handleQuery">
          <el-option v-for="dict in dict.type.aa_list_params_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="时段" prop="dtRange">
        <el-date-picker v-model="queryParams.dtRange" style="width: 340px" value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
          :picker-options="pickerOptions" @change="getFactoryNames"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="resultList" :key="refreshKey" :header-cell-style="headerCellStyle()"
      :cell-style="bodyCellStyle()" :style="tableStyle()">
      <el-table-column type="index" label="序号" width="55" align="center" fixed />
      <el-table-column prop="factoryName" label="厂区" align="center" fixed />
      <el-table-column prop="groupName" label="车间" align="center" fixed />
      <el-table-column prop="eqId" label="设备号" align="center" />
      <el-table-column prop="mcId" label="机台号" align="center" />
      <el-table-column prop="prodType" label="机型" align="center" />
      <el-table-column prop="simId" label="盒子号" align="center" />
      <el-table-column prop="dt" label="点检时间" align="center" />
      <el-table-column prop="code" label="状态" align="center">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.aa_list_params_status" :value="scope.row.code" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" align="center" show-overflow-tooltip />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script>
import { pickerOptionsSet1 } from '@/views/biz/common/js/pickerOptionsConfig'
import { bodyCellStyle, headerCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles'
import { listHistoryCheckStatus } from '@/api/biz/aa/statistics/statistics'
import { fetchHistoryFactoryNames, fetchHistoryGroupNames } from '@/api/biz/common/factoryAndGroupNames'
import { checkDtRange, dateToStr } from '@/views/biz/common/js/utils'

export default {
  name: 'index.vue',
  dicts: ['aa_list_params_status'],

  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 设备比对结果列表
      resultList: [],
      // 刷新标识
      refreshKey: 0,
      // 厂选择器
      factoryNameOptions: [],
      // 区选择器
      groupNameOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        eqId: null,
        mcId: null,
        prodType: null,
        simId: null,
        code: null,
        dtRange: []
      },
      pickerOptions: pickerOptionsSet1,
      rules: {
        dtRange: [
          {
            type: 'array',
            required: true,
            message: '请选择日期区间',
            trigger: 'blur',
            fields: {
              // type类型试情况而定,所以如果返回的是date就改成date
              0: { type: 'string', required: true, message: '请选择开始日期' },
              1: { type: 'string', required: true, message: '请选择结束日期' }
            }
          }, {
            validator: (rule, value, callback) => {
              // 调用 checkDtRange 方法并指定 intervalDays 的值
              checkDtRange(rule, value, callback, 60, 'day') // 指定 intervalDays 为 60 天
            }, trigger: 'blur'
          }]
      },
    }
  },
  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,

    /** 查询设备比对结果列表 */
    getList() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.loading = true
          this.queryParams.params = {}
          if (Array.isArray(this.queryParams.dtRange) && this.queryParams.dtRange.length === 2) {
            this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
            this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
            listHistoryCheckStatus(this.queryParams).then(response => {
              this.resultList = response.rows
              this.total = response.total
              this.loading = false
            })
          }
        }
      })
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
          this.queryParams.params = {}
          this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
          this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          fetchHistoryFactoryNames(this.queryParams).then(response => {
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

    /** 获取车间列表 */
    getGroupNames() {
      this.groupNameOptions = []
      this.checkPreInput()
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.queryParams.params = {}
          this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
          this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          fetchHistoryGroupNames(this.queryParams).then(response => {
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

    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },

    handleExport() {
      this.download('/aa/params/history/status/export', {
        ...this.queryParams
      }, `AA参数反控机台状态_${new Date().getTime()}.xlsx`)
    }
  },

  created() {
    const dtRange = this.$route.query.dtRange
    if (Array.isArray(dtRange) && dtRange.length === 2) {
      this.queryParams.dtRange = dtRange
    } else {
      this.$set(this.queryParams, 'dtRange', [dateToStr(new Date(new Date().setHours(0, 0, 0).valueOf())), dateToStr(new Date(new Date().setHours(23, 59, 59).valueOf()))])
    }
  },

  mounted() {
    this.getList()
    this.getFactoryNames()
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
