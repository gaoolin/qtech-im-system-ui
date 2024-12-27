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
      <el-form-item label="点检状态" prop="statusCode">
        <el-select v-model="queryParams.statusCode" placeholder="请输入比对结果状态" clearable @change="handleQuery">
          <el-option v-for="statusCode in statusCodeOptions" :key="statusCode.id" :label="statusCode.name"
                     :value="statusCode.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="时段" prop="dtRange">
        <el-date-picker v-model="queryParams.dtRange" :range-separator="'-'" :start-placeholder="'开始时间'"
                        :end-placeholder="'结束时间'" :default-time="['00:00:00', '23:59:59']"
                        :clearable="false" :picker-options="pickerOptions" size="small" style="width: 240px" :value-format="'yyyy-MM-dd HH:mm:ss'" type="daterange" @change="onDateChange">
        </el-date-picker>
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
      :cell-style="mergeCellStyles" :style="tableStyle()">
      <el-table-column type="index" label="序号" width="55" align="center" fixed />
      <el-table-column prop="factoryName" label="厂区" align="center" fixed />
      <el-table-column prop="groupName" label="车间" align="center" fixed />
      <el-table-column prop="eqId" label="设备号" align="center" />
      <el-table-column prop="simId" label="盒子号" align="center" />
      <el-table-column prop="mcId" label="机台号" align="center" />
      <el-table-column prop="prodType" label="机型" align="center" />
      <el-table-column prop="dt" label="点检时间" align="center" />
      <el-table-column prop="statusCode" label="状态" align="center">
        <template slot-scope="scope">
          <span
            :style="getStatusCodeStyle(scope.row.statusCode)"
            class="chk-status-label">
            {{ getStatusCodeName(scope.row.statusCode) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" align="center" show-overflow-tooltip />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script>
import { pickerOptionsSet9 } from '@/views/biz/common/js/pickerOptionsConfig'
import { bodyCellStyle, headerCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles'
import { listHistoryCheckStatus } from '@/api/biz/aa/statistics/statistics'
import { fetchHistoryFactoryNames, fetchHistoryGroupNames } from '@/api/biz/common/factoryAndGroupNames'
import { checkDtRange, dateToStr } from '@/views/biz/common/js/utils'

export default {
  name: 'index.vue',

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
      statusCodeOptions: [{ name: '正常', id: '0'},
        {name: '无模版', id: '1' },
        {name: '少参数', id: '2'},
        {name: '参数值异常', id: '3'},
        {name: '多参数', id: '4'},
        {name: '复合异常', id: '5'},
        {name: '模版离线', id: '6'},
        {name: '模版明细缺失', id: '7'}],
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
        statusCode: null,
        dtRange: []
      },
      pickerOptions: pickerOptionsSet9,
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

    onDateChange(value) {
      this.getFactoryNames();
      this.handleQuery();
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
      this.download('/aa/control/history/eq/export', {
        ...this.queryParams
      }, `AA参数反控机台状态_${new Date().getTime()}.xlsx`)
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
