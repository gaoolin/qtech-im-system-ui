<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="72px" :rules="rules">
      <el-form-item label="厂区" prop="factoryName" label-width="40px">
        <el-select v-model="queryParams.factoryName" placeholder="请输入厂区" filterable clearable @change="selectionFilter">
          <el-option v-for="item in factoryOptions" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select v-model="queryParams.groupName" placeholder="请输入车间" filterable clearable @change="selectionFilter">
          <el-option v-for="item in workshopOptions" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceType">
        <el-select v-model="queryParams.deviceType" placeholder="请输入设备类型" filterable clearable @change="selectionFilter">
          <el-option v-for="item in deviceTypeOptions" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="12" class="align-center-left">
        更新时间：<span class="highlight">{{ updateDt }}</span>
      </el-col>
      <el-col :span="12">
        <right-tool-bar-download :showSearch.sync="showSearch" @queryTable="getList" @handleExport="handleExport"></right-tool-bar-download>
      </el-col>
    </el-row>

    <!-- 警告框，数据不正常时显示，带渐显效果 -->
    <transition name="fade">
      <div v-if="showAlert" class="alert-box">数据异常：采集数据无更新！</div>
    </transition>

    <el-table v-loading="loading" :data="filterTableData" ref="table" id="table" border
              :span-method="arraySpanMethod"
              :cell-style="bodyCellStyle()"
              :header-cell-style="headerCellStyle()"
              :style="tableStyle()"
              class="table-hover">
        <el-table-column prop="factoryName" label="厂区" align="center" min-width="120" fit></el-table-column>
        <el-table-column prop="groupName" label="车间" align="center" min-width="120" fit></el-table-column>
        <el-table-column prop="deviceType" label="设备类型" align="center" min-width="120" fit></el-table-column>
        <el-table-column prop="ttlEqs" align="center" min-width="120" fit>
          <template slot="header">
            <span>设备总数</span>
            <el-tooltip class="item" effect="dark" placement="top-start" content="设备总数 = [有qcp参数模版] + [无qcp参数模版] + [未联网]">
              <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column>
          <template slot="header">
            <span>已联网</span>
            <el-tooltip class="item" effect="dark" placement="top-start" content="已联网设备数 = [有qcp参数模版] + [无qcp参数模版]">
              <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
            </el-tooltip>
          </template>
          <el-table-column prop="onlineEqs" align="center" min-width="120" fit>
            <template slot="header">
              <span>有qcp参数模版</span>
              <el-tooltip class="item" effect="dark" placement="top-start" content="设备已联网且有qcp参数模版">
                <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <span>{{ scope.row.onlineEqs !== 0 ? scope.row.onlineEqs : '' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="qcpParamsIsNull" label="无qcp参数模版" align="center" min-width="120" fit>
            <template slot="header">
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
                deviceType: scope.row.deviceType
              }
            }">
                <span>{{ scope.row.qcpParamsIsNull !== 0 ? scope.row.qcpParamsIsNull : '' }}</span>
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="remoteStatusOff" align="center" min-width="120" show-overflow-tooltip>
            <template slot="header">
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
                netStatus: 1,
                remoteStatus: 0
              }
            }">
                <span>{{ scope.row.remoteStatusOff !== 0 ? scope.row.remoteStatusOff : '' }}</span>
              </router-link>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="offlineEqs" align="center" min-width="120" fit>
          <template slot="header">
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
              netStatus: 0
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
import { arraySpanMethod as utilsArraySpanMethod, mergeAction, rowMergeHandle } from '@/views/biz/common/js/utils';
import { listQcpOverview, getDataMaxTime } from '@/api/biz/qcp/parameters';
import { fetchDataStatus } from '@/api/biz/common/eqRelated';
import RightToolBarDownload from '@/views/biz/common/RightToolBarDownload';

export default {
  name: 'index',
  components: { RightToolBarDownload },

  data() {
    return {
      showSearch: true,
      total: 0,
      loading: true,
      tableData: [],
      filterTableData: [],
      factoryOptions: [],
      workshopOptions: [],
      deviceTypeOptions: [],
      updateDt: "-",
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        deviceType: null,
        netStatus: null,
        remoteStatus: null
      },
      showAlert: false,
      rules: {},
      needMergeArr: [
        { colName: 'factoryName', mergeCheckNames: ['factoryName'] },
        { colName: 'groupName', mergeCheckNames: ['factoryName', 'groupName'] },
      ],
      rowMergeArrs: {}
    };
  },

  created() {
    this.getList();
  },

  mounted() {
    this.checkDataStatus();
    this.intervalId = setInterval(this.checkDataStatus, 5000);
  },

  beforeDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },

  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,

    getList() {
      this.loading = true;
      listQcpOverview(this.queryParams).then(response => {
        this.tableData = response.rows;
        this.filterTableData = this.tableData;
        this.updateFilterOptions();
        this.loading = false;
      });
      this.getDataMaxTime();
    },

    getDataMaxTime() {
      getDataMaxTime().then(response => {
        this.updateDt = response.data;
      });
    },

    checkDataStatus() {
      this.getDataStatus().then(isDataNormal => {
        this.showAlert = isDataNormal === 'false';
      });
    },

    getDataStatus() {
      return fetchDataStatus(null).then(response => response.data);
    },

    selectionFilter() {
      this.filterTableData = this.tableData.filter(data => {
        return (
          (this.queryParams.factoryName ? data.factoryName === this.queryParams.factoryName : true) &&
          (this.queryParams.groupName ? data.groupName === this.queryParams.groupName : true) &&
          (this.queryParams.deviceType ? data.deviceType === this.queryParams.deviceType : true)
        );
      });
      this.updateFilterOptions();
    },

    updateFilterOptions() {
      const factorySet = new Set(this.filterTableData.map(item => item.factoryName));
      const groupSet = new Set(this.filterTableData.map(item => item.groupName));
      const deviceSet = new Set(this.filterTableData.map(item => item.deviceType));

      this.factoryOptions = [...factorySet];
      this.workshopOptions = [...groupSet];
      this.deviceTypeOptions = [...deviceSet];
    },

    handleExport() {
      this.download('qcp/params/export', {...this.queryParams}, `qcp参数概览_${new Date().getTime()}.xlsx`);
    },

  },

  watch: {
    filterTableData: {
      immediate: true,
      handler() {
        this.rowMergeArrs = rowMergeHandle(this.needMergeArr, this.filterTableData);
      }
    }
  },

  computed: {
    arraySpanMethod() {
      return params => {
        // 调用已有的逻辑
        return utilsArraySpanMethod(
          params,
          this.needMergeArr,
          (val, rowIndex, colData) => mergeAction(val, rowIndex, colData, this.rowMergeArrs)
        );
      };
    },

  },

};
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
