<template>
  <div class="app-container">
    <div style="text-align:center;">
      <h1 style="margin-top: 0; padding-top: 0; font-weight: bolder" v-if="queryParams.label === '0'">qcp参数为空机台明细</h1>
    </div>

    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="72px"
      :rules="rules">
      <el-form-item label="厂区" prop="factoryName">
        <el-select v-model="queryParams.factoryName" placeholder="请输入厂区" clearable @change="handleQuery">
          <el-option v-for="item in factoryOptions" :key="item.key" :label="item.label" :value="item.label"
            :disabled="item.disabled">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select v-model="queryParams.groupName" placeholder="请输入车间" clearable @focus="getGroupNames"
          @change="handleQuery">
          <el-option v-for="item in workshopOptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceType">
        <el-select v-model="queryParams.deviceType" placeholder="请输入设备类型" clearable @change="handleQuery">
          <el-option v-for="item in deviceTypeOptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="restQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="16">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出
        </el-button>
      </el-col>
      <el-col :span="8">
        <right-tool-bar-u-d-f :showSearch.sync="showSearch" @queryTable="getList" :back="back"></right-tool-bar-u-d-f>
      </el-col>
    </el-row>

    <!-- 警告框，数据不正常时显示，带渐显效果 -->
    <transition name="fade">
      <div v-if="showAlert" class="alert-box">数据异常：采集数据近10分钟无更新！</div>
    </transition>

    <el-table v-loading="loading" :data="tableData" border :cell-style="bodyCellStyle()"
      :header-cell-style="headerCellStyle()" :style="tableStyle()">
      <el-table-column prop="factoryName" label="厂区" align="center" min-width="100" fit></el-table-column>
      <el-table-column prop="groupName" label="车间" align="center" min-width="100" fit></el-table-column>
      <el-table-column prop="deviceType" label="设备类型" align="center" min-width="60" fit></el-table-column>
      <el-table-column prop="eqId" label="设备编码" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="mcId" label="机台号" align="center" min-width="110" fit></el-table-column>
      <el-table-column prop="prodType" label="机型" align="center" min-width="80" fit></el-table-column>
      <el-table-column prop="description" label="描述" align="center" min-width="100" fit></el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script>
import { headerCellStyle, bodyCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles';
import { listQcpParams, fetchDataStatus } from '@/api/biz/qcp/parameters'
import { getFactoryNames, getGroupNames } from '@/api/biz/eqn/networking'
import RightToolBarUDF from '@/views/biz/common/RightToolBarGoBack'

export default {
  name: 'index',
  components: { RightToolBarUDF },
  data() {
    return {
      loading: true,
      showSearch: true,
      back: false,
      total: 0,
      tableData: [],
      factoryOptions: [],
      workshopOptions: [],
      deviceTypeOptions: ['DB', 'WB', 'HM', 'AA'],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: '',
        groupName: '',
        deviceType: '',
        eqId: null,
        mcId: null,
      },
      rules: {},
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
      rowMergeArrs: {} // 包含需要一个或多个合并项信息的对象
    }
  },

  created() {
    // if (this.beforeRouteEnter) {
    if (this.$route.query.label === '1') {
      this.queryParams.factoryName = this.$route.query.factoryName
      this.queryParams.groupName = this.$route.query.groupName
      this.queryParams.deviceType = this.$route.query.deviceType
      this.queryParams.label = this.$route.query.label
      this.back = true
    }
  },

  mounted() {
    this.getList()
    this.getFactoryNames()

    // 每隔5秒检查数据状态
    this.checkDataStatus();
    setInterval(() => {
      this.checkDataStatus();
    }, 5000); // 5秒（300,000毫秒）
  },

  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,
    getList() {
      this.loading = true
      listQcpParams(this.queryParams).then(response => {
        this.tableData = response.rows
        this.total = response.total
        this.rowMergeArrs = this.rowMergeHandle(this.needMergeArr, this.tableData)
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
            o.disabled = true
            this.factoryOptions.push(o)
          } else {
            this.factoryOptions.push(o)
          }
        }
      })
    },

    getGroupNames() {
      this.workshopOptions = []
      getGroupNames(this.queryParams).then(response => {
        for (const i in response.data) {
          this.workshopOptions.push(response.data[i]['groupName'])
        }
      })
    },


    async checkDataStatus() {
      // 发送请求检查数据状态的函数
      const isDataNormal = await this.getDataStatus();
      if (isDataNormal === 'true') {
        his.showAlert = true // 数据不正常时显示红色提示框
      }
      this.showAlert = false
    },
    async getDataStatus() {
      // 请求逻辑
      const response = await fetchDataStatus(); /* API 请求逻辑 */;
      return response.data;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    restQuery() {
      if (this.$route.query.label === '1') {
        this.reset()
      } else {
        this.resetForm('queryForm')
      }
      this.handleQuery()
    },

    reset() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        factoryName: '',
        groupName: '',
        deviceType: '',
        eqId: null,
        mcId: null,
      }
    },

    /** 导出 */
    handleExport() {
      this.download('qcp/params/detail/export', {
        ...this.queryParams
      }, `qcp参数模版明细_${new Date().getTime()}.xlsx`)
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },

    /** 样式控制方法 */
    tableBodyCellStyle({ row, column, rowIndex, columnIndex }) {
      return 'padding: 0; font-size: 16px; text-align: center; font-weight: bolder; '
    },

    tableHeaderCellStyle({ row, column, rowIndex, columnIndex }) {
      let cellStyle1
      cellStyle1 = 'font-size: 1vw; font-weight: bolder; text-align: center; color: #fff; background: #3498db'
      return cellStyle1
    },

    /** 表格合并行 */
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      let needMerge = this.needMergeArr.some((item) => {
        return item.colName === column.property
      })
      if (needMerge === true) {
        return this.mergeAction(column.property, rowIndex, column)
      }
    },

    mergeAction(val, rowIndex, colData) {
      let _row = this.rowMergeArrs[val].rowArr[rowIndex]
      let _col = _row > 0 ? 1 : 0
      return [_row, _col]
    },

    rowMergeHandle(arr, data) {
      if (!Array.isArray(arr) && !arr.length) return false
      if (!Array.isArray(data) && !data.length) return false
      let needMerge = {}

      arr.forEach((mergeItem) => {
        // 创建合并管理对象
        needMerge[mergeItem.colName] = {
          rowArr: [],
          rowMergeNum: 0
        }
        let currentMergeItemData = needMerge[mergeItem.colName]

        // 进行合并管理对象数据的遍历整理
        data.forEach((item, index) => {
          if (index === 0) {
            currentMergeItemData.rowArr.push(1)
            currentMergeItemData.rowMergeNum = 0
          } else {
            let currentRowData = data[index]
            let preRowData = data[index - 1]

            if (this.colMergeCheck(currentRowData, preRowData, mergeItem.mergeCheckNames)) {
              currentMergeItemData.rowArr[currentMergeItemData.rowMergeNum] += 1
              currentMergeItemData.rowArr.push(0)
            } else {
              currentMergeItemData.rowArr.push(1)
              currentMergeItemData.rowMergeNum = index
            }
          }
        })
      })
      return needMerge
    },

    colMergeCheck(currentRowData, preRowData, mergeCheckNames) {
      if (!Array.isArray(mergeCheckNames) && !mergeCheckNames.length) return false
      let result = true
      for (let index = 0; index < mergeCheckNames.length; index++) {
        const mergeCheckName = mergeCheckNames[index]
        if (currentRowData[mergeCheckName] !== preRowData[mergeCheckName]) {
          result = false
          break
        }
      }
      return result
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


.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.alert-box {
  background-color: #ffdddd;
  color: #d8000c;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #d8000c;
  text-align: center;
  font-weight: bold;
  animation: flash 1s infinite;
  /* 添加闪动效果 */
}

@keyframes flash {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
