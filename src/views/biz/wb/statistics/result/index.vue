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
      <el-form-item label="设备号" prop="eqId">
        <el-input v-model="queryParams.eqId" placeholder="请输入设备号" clearable @change="handleQuery"
          @keyup.native="handleQuery" />
      </el-form-item>
      <el-form-item label="机台号" prop="mcId">
        <el-input v-model="queryParams.mcId" placeholder="请输入机型" clearable @change="handleQuery"
          @keyup.native="handleQuery" />
      </el-form-item>
      <el-form-item label="盒子号" prop="simId">
        <el-input v-model="queryParams.simId" placeholder="请输入盒子号" clearable @change="handleQuery"
          @keyup.native="handleQuery" />
      </el-form-item>
      <el-form-item label="机型" prop="prodType">
        <el-input v-model="queryParams.prodType" placeholder="请输入机型" clearable @change="handleQuery"
          @keyup.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="statusCode">
        <el-select v-model="queryParams.statusCode" placeholder="请输入比对结果状态" clearable :key="queryParams.category"
          @change="handleQuery">
          <el-option v-for="statusCode in statusCodeOptions" :key="statusCode.id" :label="statusCode.name"
                     :value="statusCode.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="查询类型" prop="category">
        <el-select v-model="queryParams.category" placeholder="请输入查询类型" clearable @change="handleRefresh">
          <el-option  v-for="category in categoryOptions" :key="category.id" :label="category.name" :value="category.id"/>
        </el-select>
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

    <el-table v-loading="loading" :data="resultList" :key="refreshKey" :cell-style="mergeCellStyles"
      :header-cell-style="headerCellStyle()" :style="tableStyle()">
      <el-table-column type="index" label="序号" width="55" align="center" fixed />
      <el-table-column prop="factoryName" label="厂区" align="center" fixed />
      <el-table-column prop="groupName" label="车间" align="center" fixed />
      <el-table-column prop="eqId" label="设备号" align="center" />
      <el-table-column prop="simId" label="盒子号" align="center" />
      <el-table-column prop="mcId" label="机台号" align="center" />
      <el-table-column prop="prodType" label="机型" align="center" />
      <el-table-column prop="dt" label="最新比对时间" align="center" v-if="this.queryParams.category === '0'" />
      <el-table-column prop="statusCode" label="状态" align="center" v-if="this.queryParams.category === '0'">
        <template slot-scope="scope">
          <span
            :style="getStatusCodeStyle(scope.row.statusCode)"
            class="comparison-status-label">
            {{ getStatusCodeName(scope.row.statusCode) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" align="center" show-overflow-tooltip
        v-if="this.queryParams.category === '0'" />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script>
import {bodyCellStyle, headerCellStyle, tableStyle} from '@/views/biz/common/js/tableStyles';
import { listEqInfo, listWbOlpChkResult } from '@/api/biz/wb/result'
import { fetchWbOlpLatestResultFactoryNames, fetchWbOlpLatestResultGroupNames } from '@/api/biz/common/factoryAndGroupNames'
import { requiredValidator } from '@/views/biz/common/js/utils'

export default {
  name: 'index',
  dicts: ['comparison_search_type'],
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      resultList: [],
      refreshKey: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        eqId: null,
        simId: null,
        mcId: null,
        prodType: null,
        statusCode: null,
        category: '0'
      },
      // 厂选择器
      factoryNameOptions: [],
      // 区选择器
      groupNameOptions: [],
      statusCodeOptions: [{ name: 'OK', id: '0'}, { name: '金线偏移', id: '1' }, {name: '少线', id: '2'}, {name: '无程序', id: '3'}, {name: '多线', id: '4'}],
      categoryOptions: [{name: '比对结果', id: '0'}, {name: '设备信息', id: '1'}],
      rules: {
        category: [
          { message: '请选择查询类型', validator: requiredValidator, trigger: 'blur' }
        ]
      }
    }
  },

  mounted() {
    this.getList()
    this.getFactoryNames(this.queryParams)
  },

  methods: {
    bodyCellStyle,
    headerCellStyle,
    tableStyle,
    getList() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          // 获取数据
          this.loading = true
          if (this.queryParams.category === '1') {
            listEqInfo(this.queryParams).then(response => {
              this.resultList = response.rows
              this.total = response.total
              this.loading = false
            })
          } else {
            listWbOlpChkResult(this.queryParams).then(response => {
              this.resultList = response.rows
              this.total = response.total
              this.loading = false
            })
          }
        }
      })
    },
    handleRefresh() {
      /* 在 Vue 中，每个组件都有一个唯一的 key 属性。当组件的 key 属性发生改变时，Vue 会视为这是一个新的组件，而不是复用之前的组件。这样就会触发组件的重新渲染，从而实现页面的刷新 */
      // 点击刷新按钮，改变 refreshKey 的值触发组件的重新渲染
      this.refreshKey++
      // this.reset()
      this.getList()
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
          fetchWbOlpLatestResultFactoryNames(this.queryParams).then(response => {
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
          fetchWbOlpLatestResultGroupNames(this.queryParams).then(response => {
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

    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    /** 重置查询参数（resetForm是重置为初始值，此处重置为空值） */
    reset() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        prodType: null,
        simId: null,
        mcId: null,
        eqId: null,
        statusCode: null,
        category: this.queryParams.category || '0'
      }
    },

    resetQuery() {
      this.reset()
      // this.resetForm('queryForm')
      this.handleQuery()
    },

    handleExport() {
      if (this.queryParams.category === '1') {
        this.download('/wb/olp/chk/emsInfo/export', {
          ...this.queryParams
        }, `eqInfo_${new Date().getTime()}.xlsx`)
      } else if (this.queryParams.category === '0') {
        this.download('/wb/olp/chk/export', {
          ...this.queryParams
        }, `打线图比对结果信息_${new Date().getTime()}.xlsx`)
      }
    },

    /** 样式控制方法 */
    mergeCellStyles({ row, column, rowIndex, columnIndex }) {
      let baseStyle = bodyCellStyle()

      // 默认样式
      let style = {
        ...baseStyle,
        background: baseStyle.backgroundColor || '#e0f7fa'  // 这里确保背景色被重置
      };

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
        }
      } else {
        return style
      }
    },

    getStatusCodeStyle(status) {
      switch (Number(status)) {
        case 0:  // 正常状态
          return {
            background: '#4CAF50', // 绿色
            color: '#FFFFFF',      // 白色字体
            fontWeight: 'bold',
            fontSize: '16px',
            borderRadius: '4px',
            padding: '4px 8px',
            textAlign: 'center',
          };
        case 1:  // 金线偏移
          return {
            background: '#FF9800', // 橙色警告
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '16px',
            borderRadius: '4px',
            padding: '4px 8px',
            textAlign: 'center',
          };
        case 2:  // 少线
          return {
            background: '#F44336', // 深红色
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '16px',
            borderRadius: '4px',
            padding: '4px 8px',
            textAlign: 'center',
          };
        case 3:  // 无程序
          return {
            background: '#9C27B0', // 紫色
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '16px',
            borderRadius: '4px',
            padding: '4px 8px',
            textAlign: 'center',
          };
        case 4:  // 多线
          return {
            background: '#E91E63', // 粉红色
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '16px',
            borderRadius: '4px',
            padding: '4px 8px',
            textAlign: 'center',
          };
        default: // 其他状态，作为兜底样式
          return {
            background: '#BDBDBD', // 灰色
            color: '#212121',      // 深色字体
            fontWeight: 'bold',
            fontSize: '16px',
            borderRadius: '4px',
            padding: '4px 8px',
            textAlign: 'center',
          };
      }
    },

    getStatusCodeName(status) {
      const statusOption = this.statusCodeOptions.find(option => option.id === String(status));
      return statusOption ? statusOption.name : '未知状态';
    },

    getCategoryName(status) {
      const categoryOption = this.categoryOptions.find(option => option.id === String(status));
      return categoryOption ? categoryOption.name : '未知类型';
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

.comparison-status-label {
  display: inline-block; /* 使标签可以设置 padding 和圆角 */
  min-width: 60px;       /* 保证最小宽度，视觉更均衡 */
  text-align: center;    /* 文字居中对齐 */
  padding: 4px 8px;      /* 上下左右内边距，增加可读性 */
  font-size: 12px !important;       /* 字号适中，清晰易读 */
  font-weight: bold !important;     /* 字体加粗，强调状态信息 */
  color: #ffffff;        /* 默认字体颜色为白色，适配深色背景 */
  border-radius: 4px;    /* 圆角边框，柔和视觉效果 */
  line-height: 1.5;      /* 行高，保证文本垂直居中 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 添加阴影，增加立体感 */
  user-select: none;     /* 禁止选中文本，提升交互体验 */
  transition: all 0.3s ease; /* 添加过渡效果，视觉更平滑 */
}
</style>
