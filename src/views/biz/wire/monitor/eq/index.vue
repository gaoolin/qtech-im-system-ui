<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px"
      :rules="rules">
      <el-form-item label="厂区" prop="factoryName">
        <el-select v-model="queryParams.factoryName" placeholder="请输入厂区" clearable @change="handleFactoryChange">
          <el-option v-for="factory in factoryNameOptions" :key="factory.id" :label="factory.name"
            :value="factory.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select v-model="queryParams.groupName" placeholder="请输入车间" clearable @focus="getGroupNames"
          @change="handleQuery">
          <el-option v-for="groupName in groupNameOptions" :key="groupName.id" :label="groupName.name"
            :value="groupName.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="机台号" prop="mcId">
        <el-input v-model="queryParams.mcId" placeholder="请输入机台号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="EQ" prop="eqId">
        <el-input v-model="queryParams.eqId" placeholder="请输入设备编号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="机型" prop="prodType">
        <el-input v-model="queryParams.prodType" placeholder="请输入机型" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="线径" prop="wireWidth">
        <el-input v-model="queryParams.wireWidth" placeholder="请输入线径" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="statusCode">
        <el-select v-model="queryParams.statusCode" placeholder="请选择状态" clearable @change="handleQuery">
          <el-option v-for="dict in dict.type.wire_diff_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" prop="dtRange">
        <el-date-picker v-model="queryParams.dtRange" value-format="yyyy-MM-dd" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" style="width: 215px"
          @change="handleQuery">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['biz/wire/monitor:eq:export']">导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-card>
      <el-table v-loading="loading" :data="tableList" :cell-style="bodyCellStyle()" :header-cell-style="headerCellStyle()"
        :style="tableStyle()">
        <el-table-column label="序号" type="index" width="55" align="center" />
        <el-table-column label="厂区" align="center" prop="factoryName" />
        <el-table-column label="车间" align="center" prop="groupName" />
        <el-table-column label="设备编号(EQ)" align="center" width="180" prop="eqId" show-overflow-tooltip />
        <el-table-column label="机台号" align="center" width="150" prop="mcId" show-overflow-tooltip />
        <el-table-column label="机型" align="center" prop="propType" />
        <el-table-column label="线径" align="center" width="180" prop="wireWidth" show-overflow-tooltip />
        <el-table-column label="实际用量" align="center" prop="actualWireUsage">
          <template slot-scope="scope">{{ getBit(scope.row.actualWireUsage, 4) }}</template>
        </el-table-column>
        <el-table-column label="维护用量" align="center" prop="standardWireUsage">
          <template slot-scope="scope">{{ getBit(scope.row.standardWireUsage, 4) }}</template>
        </el-table-column>
        <el-table-column label="BOM用量" align="center" prop="bomWireUsage">
          <template slot-scope="scope">{{ getBit(scope.row.bomWireUsage, 4) }}</template>
        </el-table-column>
        <el-table-column label="产量" align="center" prop="yield">
          <template slot-scope="scope">{{ numberToCurrencyNo(getBit(scope.row.yield, 0)) }}</template>
        </el-table-column>
        <el-table-column label="差异(%)" align="center" prop="percents">
          <template slot-scope="scope">{{ getBit(scope.row.percents, 2) }}</template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
        @pagination="getList" />
    </el-card>
  </div>
</template>

<script>
import { headerCellStyle, bodyCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles';
import { pickerOptionsSet2 } from '@/views/biz/common/js/pickerOptionsConfig'
import { listEq } from '@/api/biz/wire/eq'
import { fetchWireFactoryNames, fetchWireGroupNames } from '@/api/biz/common/factoryAndGroupNames'
import { checkDtRange, getBit, numberToCurrencyNo } from '@/views/biz/common/js/utils'

export default {
  name: 'Eq',
  dicts: ['wire_diff_status'],
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
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 金线消耗量表格数据
      tableList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        mcId: null,
        eqId: null,
        prodType: null,
        wireWidth: null,
        dtRange: [],
        statusCode: null
      },
      // 表单校验
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
              checkDtRange(rule, value, callback, 366, 'day') // 指定 intervalDays 为 60 天
            }, trigger: 'blur'
          }]
      },
      // 厂选择器
      factoryNameOptions: [],
      // 区选择器
      groupNameOptions: [],
      // 时间选择器范围
      pickerOptions: pickerOptionsSet2,
    }
  },

  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,
    getBit,
    numberToCurrencyNo,
    /** 查询金线消耗量列表 */
    getList() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.loading = true
          this.queryParams.params = {}
          this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
          this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          listEq(this.queryParams).then(response => {
            this.tableList = response.rows
            this.total = response.total
            this.loading = false
          })
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
    /** 远程获取厂区名称 */
    getFactoryNames() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.factoryNameOptions = []
          this.queryParams.params = {}
          this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
          this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          fetchWireFactoryNames(this.queryParams).then(response => {
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
      if (!this.queryParams.factoryName) {
        this.$message.error('请先选择厂区')
        return
      }
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.queryParams.params = {}
          this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
          this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          fetchWireGroupNames(this.queryParams).then(response => {
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

    /** 导出按钮操作 */
    handleExport() {
      this.download('biz/wire/monitor/eq/export', {
        ...this.queryParams
      }, `设备金线用量_${new Date().getTime()}.xlsx`)
    },
  },

  created() {
    const dtRange = this.$route.query.dtRange;
    if (Array.isArray(dtRange) && dtRange.length === 2) {
      this.queryParams.dtRange = dtRange;
    } else {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1);
      const startOfNextDay = new Date(nextDay.setHours(0, 0, 0, 0));

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      this.$set(this.queryParams, 'dtRange', [
        formatDate(startOfDay),
        formatDate(startOfNextDay)
      ]);
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
