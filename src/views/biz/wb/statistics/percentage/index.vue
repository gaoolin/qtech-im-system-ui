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
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请输入比对状态" clearable :key="queryParams.category"
          @change="handleQuery">
          <el-option v-for="dict in dict.type.comparison_result_code" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="时段" prop="dtRange">
        <el-date-picker v-model="queryParams.dtRange" style="width: 340px" value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
          :picker-options="pickerOptions" @change="getFactoryNames, handleQuery"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="restQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="12">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
      </el-col>
      <el-col :span="12">
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="tableData" :span-method="arraySpanMethod" :cell-style="bodyCellStyle()"
      :header-cell-style="headerCellStyle()" :style="tableStyle()" class="table-hover">
      <el-table-column prop="factoryName" label="厂区" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="groupName" label="车间" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="eqId" label="设备编号" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="mcId" label="机台号" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="prodType" label="机种" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="computeCnt" label="比对次数" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="okCnt" label="正确次数" align="center" min-width="120" fit>
        <template slot-scope="scope">
          <router-link :to="{
            path: '/biz/wb/statistics/particulars', query: {
              dtRange: queryParams.dtRange,
              factoryName: scope.row.factoryName,
              groupName: scope.row.groupName,
              eqId: scope.row.eqId,
              prodType: scope.row.prodType,
              flag: 'ok'
            }
          }">
            <span>{{ numberToCurrencyNo(scope.row.okCnt) }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="errCnt" label="错误次数" align="center" min-width="120" fit>
        <template slot-scope="scope">
          <router-link :to="{
            path: '/biz/wb/statistics/particulars', query: {
              dtRange: queryParams.dtRange,
              factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
              groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
              eqId: scope.row.eqId,
              prodType: scope.row.prodType,
              flag: 'err'
            }
          }">
            <span>{{ scope.row.errCnt > 0 ? numberToCurrencyNo((scope.row.errCnt)) : '-' }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="errRatio" label="错误率" align="center" min-width="120" fit>
        <template slot-scope="scope">
          <span>{{ toPercent(getBit(scope.row.errRatio, 6), 2) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script>
import { pickerOptionsSet1 } from '@/views/biz/common/js/pickerOptionsConfig'
import { headerCellStyle, bodyCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles';
import { getBit, toPercent, numberToCurrencyNo, dateToStr, checkDtRange, arraySpanMethod, mergeAction, rowMergeHandle } from '@/views/biz/common/js/utils';
import { listComparisonRatio } from '@/api/biz/wb/percentage'
import { fetchWbOlpOverviewFactoryNames, fetchWbOlpOverviewGroupNames } from '@/api/biz/common/factoryAndGroupNames'

export default {
  name: 'index',
  dicts: ['comparison_result_code'],

  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      loading: true,
      tableData: null,
      pickerOptions: pickerOptionsSet1,
      // 厂选择器
      factoryNameOptions: [],
      // 区选择器
      groupNameOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        mcId: null,
        eqId: null,
        prodType: null,
        dtRange: [],
        flag: null,
      },
      // 需要合并项的列
      needMergeArr: [
        {
          colName: 'factoryName',
          mergeCheckNames: ['factoryName']
        },
        {
          colName: 'groupName',
          mergeCheckNames: ['factoryName', 'groupName']
        }
      ],
      rowMergeArrs: {}, // 包含需要一个或多个合并项信息的对象
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
    toPercent,
    getBit,
    numberToCurrencyNo,

    getList() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.loading = true;
          this.queryParams.params = {}
          this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
          this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          listComparisonRatio(this.queryParams).then(response => {
            this.tableData = response.rows
            this.total = response.total;
            this.rowMergeArrs = rowMergeHandle(this.needMergeArr, response.rows)
            this.loading = false
          })

        }
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    restQuery() {
      if (!this.$route.query.dtRange) {
        this.resetForm("queryForm");
      } else {
        this.reset();
      }
      this.handleQuery();
    },
    /** 重置查询参数（resetForm是重置为初始值，此处重置为空值） */
    reset() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        dtRange: [dateToStr(new Date(new Date().setHours(0, 0, 0).valueOf())), dateToStr(new Date(new Date().setHours(23, 59, 59).valueOf()))],
        prodType: null,
        flag: null,
      }
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
          fetchWbOlpOverviewFactoryNames(this.queryParams).then(response => {
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
          this.queryParams.params = {}
          this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
          this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          fetchWbOlpOverviewGroupNames(this.queryParams).then(response => {
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

    checkPreInput() {
      if (!this.queryParams.factoryName) {
        this.$message.error('请先选择厂区')
        return
      }
    },

    /** 导出 */
    handleExport() {
      this.download('wb/olp/percentage/export', {
        ...this.queryParams
      }, `打线图机台比对正确率_${new Date().getTime()}.xlsx`)
    },
    /** 重置按钮操作 */
    resetQuery() {
      if (!this.$route.query) {
        this.resetForm("queryForm");
      } else {
        this.reset();
      }
      this.handleQuery();
    },
  },

  created() {
    // 日期区间回显
    const dtRange = this.$route.query.dtRange
    if (dtRange) {
      this.queryParams.dtRange = dtRange
    } else {
      this.$set(this.queryParams, 'dtRange', [dateToStr(new Date(new Date().setHours(0, 0, 0).valueOf())), dateToStr(new Date(new Date().setHours(23, 59, 59).valueOf()))])
    }
    this.queryParams.factoryName = this.$route.query.factoryName
    this.queryParams.groupName = this.$route.query.groupName
    this.queryParams.eqId = this.$route.query.eqId
    this.queryParams.mcId = this.$route.query.mcId
    this.queryParams.prodType = this.$route.query.prodType
    this.queryParams.flag = this.$route.query.flag
  },

  mounted() {
    this.getList()
    this.getFactoryNames(this.queryParams)
  },

  computed: {
    arraySpanMethod() {
      return (params) => {
        return arraySpanMethod(params, this.needMergeArr, (val, rowIndex, colData) => {
          return mergeAction(val, rowIndex, colData, this.rowMergeArrs);
        });
      };
    }
  },

  watch: {
    tableData: {
      deep: true,
      handler() {
        this.rowMergeArrs = rowMergeHandle(this.needMergeArr, this.tableData);
      }
    }
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
