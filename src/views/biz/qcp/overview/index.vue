<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="72px"
      :rules="rules">
      <el-form-item label="厂区" prop="factoryName" label-width="40px">
        <el-select v-model="queryParams.factoryName" placeholder="请输入厂区" filterable clearable
          @change="selectionFilter(queryParams)">
          <el-option v-for="item in factoryOptions" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select v-model="queryParams.groupName" placeholder="请输入车间" filterable clearable
          @change="selectionFilter(queryParams)">
          <el-option v-for="item in workshopOptions" style="width: 240px" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceType">
        <el-select v-model="queryParams.deviceType" placeholder="请输入设备类型" filterable clearable
          @change="selectionFilter(queryParams)">
          <el-option v-for="item in deviceTypeOptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="12" class="align-center-left">
        更新时间：<span class="highlight">{{ updateDt }}</span>
      </el-col>
      <el-col :span="12">
        <right-tool-bar-download :showSearch.sync="showSearch" @queryTable="getList"
          @handleExport="handleExport"></right-tool-bar-download>
      </el-col>
    </el-row>

    <!-- 警告框，数据不正常时显示，带渐显效果 -->
    <transition name="fade">
      <div v-if="showAlert" class="alert-box">数据异常：采集数据近10分钟无更新！</div>
    </transition>

    <el-table v-loading="loading" :data="filterTableData" ref="table" id="table" show-summary border
      :span-method="arraySpanMethod" :cell-style="bodyCellStyle()" :header-cell-style="headerCellStyle()"
      :style="tableStyle()" class="table-hover">
      <el-table-column prop="factoryName" label="厂区" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="groupName" label="车间" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="deviceType" label="设备类型" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="ttlEqs" align="center" min-width="120" fit>
        <template slot-scope="scope" slot="header">
          <span>设备总数</span>
          <el-tooltip class="item" effect="dark" placement="top-start" content="设备总数 = [有qcp参数模版] + [无qcp参数模版] + [未联网]">
            <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope" slot="header">
          <span>已联网</span>
          <el-tooltip class="item" effect="dark" placement="top-start" content="已联网设备数 = [有qcp参数模版] + [无qcp参数模版]">
            <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
          </el-tooltip>
        </template>
        <el-table-column prop="onlineEqs" align="center" min-width="120" fit>
          <template slot-scope="scope" slot="header">
            <span>有qcp参数模版</span>
            <el-tooltip class="item" effect="dark" placement="top-start" content="设备已联网且有qcp参数模版">
              <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="qcpParamsIsNull" label="无qcp参数模版" align="center" min-width="120" fit>
          <template slot-scope="scope" slot="header">
            <span>无qcp参数模版</span>
            <el-tooltip class="item" effect="dark" placement="top-start" content="设备已联网无qcp参数模版">
              <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <router-link :to="{
              path: '/biz/qcp/detail', query: {
                factoryName: scope.row.factoryName,
                groupName: scope.row.groupName,
                deviceType: scope.row.deviceType,
                label: 1
              }
            }">
              <span>{{ scope.row.qcpParamsIsNull !== 0 ? scope.row.qcpParamsIsNull : '' }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="remoteControlOff" align="center" min-width="120" show-overflow-tooltip>
          <template slot-scope="scope" slot="header">
            <span>未开启远程</span>
            <el-tooltip class="item" effect="dark" placement="top-start" content="已联网设备中没有开启远程反控（控制）功能的设备">
              <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <router-link :to="{
              path: '/biz/eqn/networking', query: {
                factoryName: scope.row.factoryName,
                groupName: scope.row.groupName,
                deviceType: scope.row.deviceType,
                status: 1,
                label: 2
              }
            }">
              <span>{{ scope.row.remoteControlOff !== 0 ? scope.row.remoteControlOff : '' }}</span>
            </router-link>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column prop="offlineEqs" align="center" min-width="120" fit>
        <template slot-scope="scope" slot="header">
          <span>未联网</span>
          <el-tooltip class="item" effect="dark" placement="top-start" content="设备没有联网，无远程反控（控制）功能">
            <i class="el-icon-question" style="color:#272728; margin-left:2px;"> </i>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <router-link :to="{
            path: '/biz/eqn/networking', query: {
              factoryName: scope.row.factoryName,
              groupName: scope.row.groupName,
              deviceType: scope.row.deviceType,
              label: 1
            }
          }">
            <span>{{ scope.row.offlineEqs !== 0 ? scope.row.offlineEqs : '' }}</span>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import { headerCellStyle, bodyCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles';
import { arraySpanMethod, mergeAction, rowMergeHandle } from '@/views/biz/common/js/utils';
import { listQcpOverview, fetchDataStatus, getDataMaxTime } from '@/api/biz/qcp/parameters'
import RightToolBarDownload from '@/views/biz/common/RightToolBarDownload'

export default {
  name: 'index',
  components: { RightToolBarDownload },

  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      loading: true,
      tableData: [],
      filterTableData: [],
      companyFilter: [],
      groupNameFilter: [],
      deviceTypeFilter: [],
      companyFilterTmp: [],
      groupNameFilterTmp: [],
      deviceTypeFilterTmp: [],
      // 厂选择器
      factoryOptions: [],
      // 区选择器
      workshopOptions: [],
      deviceTypeOptions: [],
      updateDt: "-",
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: '',
        groupName: '',
        deviceType: '',
        status: null,
        remoteControlOff: null,
      },
      // 数据状态变量
      showAlert: false,
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
    if (this.beforeRouteEnter) {
    } else {
      this.getList()
      this.getDataMaxTime()
    };
  },

  mounted() {
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
      listQcpOverview(this.queryParams).then(response => {
        this.tableData = response.rows
        this.filterTableData = this.tableData
        for (const re of this.filterTableData) {
          this.companyFilterTmp.push(re.factoryName)
          this.groupNameFilterTmp.push(re.groupName)
          this.deviceTypeFilterTmp.push(re.deviceType)
        }

        const companySet = new Set(this.companyFilterTmp)
        const groupNameSet = new Set(this.groupNameFilterTmp)
        const deviceTypeSet = new Set(this.deviceTypeFilterTmp)
        this.factoryOptions = Array.from(companySet)
        this.workshopOptions = Array.from(groupNameSet)
        this.deviceTypeOptions = Array.from(deviceTypeSet)

        this.loading = false
      })
    },

    getDataMaxTime() {
      getDataMaxTime().then(response => {
        this.updateDt = response.data
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

    async selectionFilter(val) {
      await this.tableDataFilter(val)
      await this.updateSelectionElements(this.filterTableData)
    },

    tableDataFilter(val) {
      this.filterTableData = this.tableData.filter(function (data) {
        let a = false
        let b = false
        let c = false

        if (val.factoryName !== '') {
          a = data.factoryName === val.factoryName
        } else {
          a = true
        }

        if (val.groupName !== '') {
          b = data.groupName === val.groupName
        } else {
          b = true
        }

        if (val.deviceType !== '') {
          c = data.deviceType === val.deviceType
        } else {
          c = true
        }
        return a && b && c
      })
    },

    updateSelectionElements(val) {
      this.groupNameFilterTmp = []
      this.deviceTypeFilterTmp = []
      for (const re of val) {
        this.groupNameFilterTmp.push(re.groupName)
        this.deviceTypeFilterTmp.push(re.deviceType)
      }
      const groupNameSetTmp = new Set(this.groupNameFilterTmp)
      const deviceTypeSetTmp = new Set(this.deviceTypeFilterTmp)
      this.workshopOptions = Array.from(groupNameSetTmp)
      this.deviceTypeOptions = Array.from(deviceTypeSetTmp)
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    restQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },

    /** 导出 */
    handleExport() {
      this.download('qcp/params/export', {
        ...this.queryParams
      }, `qcp参数概览_${new Date().getTime()}.xlsx`)
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
  },
  watch: {
    filterTableData: {
      immediate: true,
      handler() {
        // await this.$nextTick(); 根据实际选择延迟调用
        this.$nextTick(() => {
          const tds = document.querySelectorAll('#table .el-table__footer-wrapper tr>td')
          // console.log(tds)
          tds[0].colSpan = 3
          tds[0].style.textAlign = 'center'
          // tds[0].style.background = '#3498db'
          tds[0].style.background = '#4fc3f7'
          tds[0].style.color = '#ffffff'
          tds[0].style.fontSize = '1vw'
          tds[0].style.fontWeight = 'bold'
          // 合并3个单元格右移了2个空单元格，需对其进行设置
          tds[1].style.display = 'none'
          tds[2].style.display = 'none'
          tds[3].style.background = '#4fc3f7'
          tds[3].style.color = '#ffffff'
          tds[3].style.fontSize = '1vw'
          tds[3].style.fontWeight = 'bold'
          tds[4].style.background = '#4fc3f7'
          tds[4].style.color = '#ffffff'
          tds[4].style.fontSize = '1vw'
          tds[4].style.fontWeight = 'bold'
          tds[5].style.background = '#4fc3f7'
          tds[5].style.color = '#ffffff'
          tds[5].style.fontSize = '1vw'
          tds[5].style.fontWeight = 'bold'
          tds[6].style.background = '#4fc3f7'
          tds[6].style.color = '#ffffff'
          tds[6].style.fontSize = '1vw'
          tds[6].style.fontWeight = 'bold'
          tds[7].style.background = '#4fc3f7'
          tds[7].style.color = '#ffffff'
          tds[7].style.fontSize = '1vw'
          tds[7].style.fontWeight = 'bold'
        });

        this.rowMergeArrs = rowMergeHandle(this.needMergeArr, this.filterTableData);
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
    },
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

::v-deep .el-table .el-table__header-wrapper th,
.el-table .el-table__fixed-header-wrapper th {
  padding: 0;
  height: 20px !important;
}

::v-deep .el-table .el-table__body-wrapper td,
.el-table .el-table__fixed-body-wrapper td,
.el-table .el-table__footer-wrapper td,
.el-table .el-table__fixed-footer-wrapper td,
.el-table .el-table__body el-table__row {
  padding: 1px !important;
}

.align-center-left {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  line-height: 28px;
  /* 统一行高为28px，与第二个el-col一致 */
}

.highlight {
  font-weight: bolder;
  justify-content: flex-start;
  align-items: flex-end;
  color: red;
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
