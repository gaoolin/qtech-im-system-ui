<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px" :rules="rules">
      <el-form-item label="时段" prop="dtRange">
        <el-date-picker
          v-model="queryParams.dtRange"
          style="width: 350px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
          @change="handleQuery"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="厂区" prop="factoryName">
        <el-select
          v-model="queryParams.factoryName"
          placeholder="请输入厂区"
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="item in factoryOptions"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select
          v-model="queryParams.groupName"
          placeholder="请输入车间"
          clearable
          @focus="getGroupNames"
          @change="handleQuery"
        >
          <el-option
            v-for="item in workshopOptions"
            style="width: 240px"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="机型" prop="prodType">
        <el-input
          v-model="queryParams.prodType"
          placeholder="请输入机型"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="12">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <el-col :span="12">
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="tableData"
      :span-method="arraySpanMethod"
      :cell-style="mergeCellStyles"
      :header-cell-style="headerCellStyle()"
      :style="tableStyle()"
    >
      <el-table-column prop="factoryName" label="厂区" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="groupName" label="车间" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="eqId" label="设备编号" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="mcId" label="机台号" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="prodType" label="机种" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="dt" label="时间" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="code" label="状态码" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="description" label="描述" align="center" min-width="120" show-overflow-tooltip
      ></el-table-column>
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
import { pickerOptionsSet1 } from '@/views/biz/common/js/pickerOptionsConfig'
import { bodyCellStyle, headerCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles'
import { getBit, toPercent, dateToStr, checkDtRange, arraySpanMethod, mergeAction, rowMergeHandle } from '@/views/biz/common/js/utils';
import { listComparisonDetail } from '@/api/biz/wb/percentage'
import { getFactoryNames, getGroupNames } from '@/api/biz/wb/index'

export default {
  name: 'index',
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
      factoryOptions: [],
      // 区选择器
      workshopOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        dtRange: [],
        prodType: null,
        flag: null,
        code: null
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
              checkDtRange(rule, value, callback); // 指定 intervalDays 为 60 天
            }, trigger: 'blur',
          }]
      }
    }
  },

  created() {
    // 日期区间回显
    if (this.$route.query.dtRange === undefined || this.$route.query.dtRange === null || this.$route.query.dtRange === '') {
      this.$set(this.queryParams, 'dtRange', [dateToStr(new Date(new Date().setHours(0, 0, 0).valueOf())), dateToStr(new Date(new Date().setHours(23, 59, 59).valueOf()))])
    } else {
      this.queryParams.dtRange = this.$route.query.dtRange
      this.queryParams.factoryName = this.$route.query.factoryName
      this.queryParams.groupName = this.$route.query.groupName
      this.queryParams.eqId = this.$route.query.eqId
      this.queryParams.prodType = this.$route.query.prodType
      this.queryParams.flag = this.$route.query.flag
      this.queryParams.code = this.$route.query.code
    }

  },

  mounted() {
    this.getList()
    // overview.methods.getFactoryNames()
    this.getFactoryNames()
  },

  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,
    getBit, toPercent, 
    getList() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.loading = true
          this.queryParams.params = {}
          if (null != this.queryParams.dtRange && '' !== this.queryParams.dtRange) {
            this.queryParams.params['beginDate'] = this.queryParams.dtRange[0]
            this.queryParams.params['endDate'] = this.queryParams.dtRange[1]
            listComparisonDetail(this.queryParams).then(response => {
              this.tableData = response.rows
              this.total = response.total
              this.loading = false
            })
          }
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
      if (this.$route.query.dtRange === undefined || this.$route.query.dtRange === null || this.$route.query.dtRange === '') {
        this.resetForm('queryForm')
      } else {
        this.reset()
      }
      this.handleQuery()
    },
    getFactoryNames() {
      getFactoryNames().then(response => {
        for (const i in response.data) {
          this.factoryOptions.push(response.data[i]['factoryName'])
        }
      })
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
        code: null
      }
    },
    getGroupNames() {
      this.workshopOptions = []
      getGroupNames(this.queryParams).then(response => {
        for (const i in response.data) {
          this.workshopOptions.push(response.data[i]['groupName'])
        }
      })
    },

    /** 导出 */
    handleExport() {
      this.download('wb/olp/particulars/export', {
        ...this.queryParams
      }, `打线图机台比对明细_${new Date().getTime()}.xlsx`)
    },

    /** 样式控制方法 */
    mergeCellStyles({ row, column, rowIndex, columnIndex }) {
      let baseStyle = bodyCellStyle()

      // 默认样式
      let style = {
        ...baseStyle,
        background: baseStyle.backgroundColor || '#e0f7fa'  // 这里确保背景色被重置
      };

      if ((columnIndex === 6 && row[column.property] > 0) || (columnIndex === 7 && row[column.property] !== 'qualified')) {
        return {
          ...baseStyle,
          background: '#FFF3E0', // 增加背景颜色，突显警示效果
          color: '#D32F2F', // 柔和的砖红色
          fontSize: '12px', // 略微调小字体使其更协调
          fontWeight: 'bold', // 字体加粗
          // padding: '8px', // 添加内边距
          // border: '1px solid #B71C1C', // 添加边框
          // boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', // 添加阴影效果
          // transition: 'all 0.3s ease' // 添加过渡效果
        }
      } else {
        return style
      }
    },

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

