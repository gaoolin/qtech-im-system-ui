<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px" :rules="rules">
      <el-form-item label="厂区" prop="factoryName">
        <el-select v-model="queryParams.factoryName" placeholder="请选择厂区" clearable filterable @change="handleFactoryChange">
          <el-option v-for="item in factoryNameOptions" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select v-model="queryParams.groupName" placeholder="请选择车间" clearable filterable @change="handleQuery" @focus="checkPreInput">
          <el-option v-for="item in groupNameOptions" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="设备编号" prop="eqId">
        <el-input v-model="queryParams.eqId" placeholder="请输入设备编号" clearable style="width: 240px;"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="机台号" prop="mcId">
        <el-input v-model="queryParams.mcId" placeholder="请输入机台号" clearable style="width: 240px;"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="机型" prop="prodType">
        <el-select v-model="queryParams.prodType" placeholder="请选择机型" clearable filterable>
        </el-select>
      </el-form-item>
      <el-form-item label="时段" prop="dtRange">
        <el-date-picker v-model="queryParams.dtRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" @change="getFactoryNames, handleQuery">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="12" style="display: flex; align-items: center;">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >
          导出
        </el-button>
      </el-col>
      <el-col :span="12">
        <right-tool-bar-go-back :showSearch.sync="showSearch" @queryTable="getList"  :back="back"/>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="tableData" :span-method="arraySpanMethod" :cell-style="mergeCellStyles"
              :header-cell-style="headerCellStyle()" :style="tableStyle()">
      <el-table-column prop="factoryName" label="厂区" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="groupName" label="车间" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="eqId" label="设备编号" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="mcId" label="机台号" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="prodType" label="机种" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="chkDt" label="比对时间" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="statusCode" label="状态" align="center" min-width="120" fit>
        <template slot-scope="scope">
          <span
            :style="getStatusCodeStyle(scope.row.statusCode)"
            class="chk-status-label">
            {{ getStatusCodeName(scope.row.statusCode) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" align="center" min-width="120" show-overflow-tooltip></el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
                @pagination="getList" />
  </div>
</template>

<script>
import { pickerOptionsSet1 } from '@/views/biz/common/js/pickerOptionsConfig'
import { bodyCellStyle, headerCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles'
import { getBit, toPercent, dateToStr, checkDtRange, arraySpanMethod, mergeAction, rowMergeHandle } from '@/views/biz/common/js/utils';
import { listAaParamsChkDetail } from '@/api/biz/aa/statistics/particalurs'
import { fetchWbOlpOverviewFactoryNames, fetchWbOlpOverviewGroupNames } from '@/api/biz/common/factoryAndGroupNames'
import RightToolBarGoBack from "@/views/biz/common/RightToolBarGoBack";

export default {
  components: { RightToolBarGoBack },
  name: 'index',
  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      back: false,
      // 总条数
      total: 0,
      loading: true,
      tableData: null,
      pickerOptions: pickerOptionsSet1,
      // 厂选择器
      factoryNameOptions: [],
      // 区选择器
      groupNameOptions: [],
      statusCodeOptions: [{ name: '正常', id: '0'},
        { name: '无模版', id: '1' },
        {name: '少参数', id: '2'},
        {name: '参数值异常', id: '3'},
        {name: '多参数', id: '4'},
        {name: '复合异常', id: '5'},
        {name: '模版离线', id: '6'},
        {name: '模版明细缺失', id: '7'}],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        dtRange: [],
        prodType: null,
        flag: null,
        statusCode: null
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
    this.queryParams.statusCode = this.$route.query.statusCode
    this.back = true

    console.log(this.$route.query)
    console.log(this.queryParams)
  },

  mounted() {
    this.getList()
    this.getFactoryNames(this.queryParams)
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
          this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
          this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          listAaParamsChkDetail(this.queryParams).then(response => {
            this.tableData = response.rows
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
        statusCode: null
      }
    },

    /** 重置按钮操作 */
    resetQuery() {
      if (!this.$route.query) {
        this.reset()
        this.back = false
      } else {
        this.resetForm("queryForm");
      }
      this.handleQuery();
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList()
    },
    /** 导出 */
    handleExport() {
      this.download('wb/olp/particulars/export', {
        ...this.queryParams
      }, `打线图机台比对明细_${new Date().getTime()}.xlsx`)
    },

    getStatusCodeStyle(status) {
      switch (Number(status)) {
        case 0:  // 正常状态
          return {
            backgroundColor: '#4CAF50',  // 绿色背景，代表正常
            color: '#FFFFFF',            // 白色字体
            border: '1px solid #388E3C'  // 边框稍深的绿色，增强层次感
          };
        case 1:  // 无模版
          return {
            backgroundColor: '#FFCA28',  // 深黄色背景，提示警告
            color: '#5D4037',            // 深棕色字体
            border: '1px solid #FFB300'  // 边框颜色，稍深的黄色
          };
        case 2:  // 少参数
          return {
            backgroundColor: '#FF7043',  // 橙色背景，表示异常
            color: '#FFFFFF',            // 白色字体
            border: '1px solid #F4511E'  // 边框颜色，稍深的橙色
          };
        case 3:  // 参数值异常
          return {
            backgroundColor: '#F44336',  // 红色背景，严重异常
            color: '#FFFFFF',            // 白色字体
            border: '1px solid #D32F2F'  // 深红色边框，强调严重性
          };
        case 4:  // 多参数
          return {
            backgroundColor: '#E91E63',  // 粉红色背景，特殊异常
            color: '#FFFFFF',            // 白色字体
            border: '1px solid #C2185B'  // 深粉红边框
          };
        case 5:  // 复合异常
          return {
            backgroundColor: '#AB47BC',  // 紫色背景，复合异常
            color: '#FFFFFF',            // 白色字体
            border: '1px solid #8E24AA'  // 深紫色边框
          };
        case 6:  // 模版离线
          return {
            backgroundColor: '#9E9E9E',  // 灰色背景，代表离线
            color: '#FFFFFF',            // 白色字体
            border: '1px solid #757575'  // 深灰色边框
          };
        case 7:  // 模版明细缺失
          return {
            backgroundColor: '#78909C',  // 蓝灰色背景
            color: '#FFFFFF',            // 白色字体
            border: '1px solid #546E7A'  // 深蓝灰边框
          };
        default:  // 未知状态，兜底样式
          return {
            backgroundColor: '#BDBDBD',  // 浅灰色背景
            color: '#212121',            // 深灰色字体
            border: '1px solid #9E9E9E'  // 深灰色边框
          };
      }
    },

    getStatusCodeName(status) {
      const statusOption = this.statusCodeOptions.find(option => option.id === String(status));
      return statusOption ? statusOption.name : '未知状态';
    },

    /** 样式控制方法 */
    mergeCellStyles({ row, column, rowIndex, columnIndex }) {
      let baseStyle = bodyCellStyle(); // 基础单元格样式

      // 默认样式
      let style = {
        ...baseStyle,
        background: baseStyle.backgroundColor || '#e0f7fa' // 确保默认背景色
      };

      // 如果当前是第7列，且第6列的值大于0，则应用警告样式
      if (columnIndex === 9 && Number(row.statusCode) > 0) {
        return {
          ...baseStyle,
          background: '#FFF3E0',   // 背景色，突显警示效果
          color: '#D32F2F',        // 柔和的砖红色字体
          fontSize: '12px',        // 字号适中
          fontWeight: 'bold',      // 字体加粗
          border: '1px solid #FFCCBC', // 细边框，增强视觉效果
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // 轻微阴影
          transition: 'all 0.3s ease' // 平滑过渡效果
        };
      }

      // 其他情况下，保持默认样式
      return style;
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

.chk-status-label {
    display: inline-block; /* 保证标签拥有良好的排版特性 */
    min-width: 60px;      /* 保证标签宽度，适配多种状态名称 */
    text-align: center;    /* 文本居中 */
    padding: 4px 8px;     /* 上下左右内边距，增加可读性 */
    font-size: 12px;       /* 字号适中 */
    font-weight: bold;     /* 字体加粗 */
    color: #ffffff;        /* 默认字体颜色为白色，适配深色背景 */
    border-radius: 4px;    /* 圆角边框，视觉柔和 */
    line-height: 1.5;      /* 行高，保证垂直居中 */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); /* 添加微弱阴影，增加立体感 */
    user-select: none;     /* 禁止选中文本 */
    transition: all 0.3s ease-in-out; /* 平滑过渡效果 */
}

</style>
