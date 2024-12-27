<template>
  <div class="app-container">

    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="72px"
      :rulues="rules">
      <el-form-item label="厂区" prop="factoryName">
        <el-select v-model="queryParams.factoryName" placeholder="请输入厂区" clearable @change="handleFactoryChange">
          <el-option v-for="factory in factoryNameOptions" :key="factory.id" :label="factory.name" :value="factory.name"
            :disabled="factory.disabled"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select v-model="queryParams.groupName" placeholder="请输入车间" clearable @focus="checkPreInput"
                   @change="handleQuery">
          <el-option v-for="groupName in groupNameOptions" :key="groupName.id" :label="groupName.name"
                     :value="groupName.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceType">
        <el-select v-model="queryParams.deviceType" placeholder="请输入设备类型" clearable @change="handleQuery">
          <el-option v-for="deviceType in deviceTypeOptions" :key="deviceType.id" :label="deviceType.name" :value="deviceType.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备编码" prop="eqId">
        <el-input v-model="queryParams.eqId" placeholder="请输入设备编码" clearable @change="handleQuery">
        </el-input>
      </el-form-item>
      <el-form-item label="机台号" prop="mcId">
        <el-input v-model="queryParams.mcId" placeholder="请输入机台号" clearable @change="handleQuery">
        </el-input>
      </el-form-item>
      <el-form-item label="盒子号" prop="simId">
        <el-input v-model="queryParams.simId" placeholder="请输入盒子号" clearable @change="handleQuery">
        </el-input>
      </el-form-item>
      <el-form-item label="设备联网" prop="netStatus" >
        <el-select v-model="queryParams.netStatus" placeholder="请输入设备联网状态" clearable @change="handleQuery">
          <el-option v-for="netStatus in netStatusOptions" :key="netStatus.id" :label="netStatus.name"
                     :value="netStatus.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="远程开关" prop="remoteStatus" v-if="queryParams.label !== '1'">
        <el-select v-model="queryParams.remoteStatus" placeholder="请输入远程状态" clearable @change="handleQuery">
          <el-option v-for="dict in dict.type.remote_control_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- 左侧导出按钮 -->
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

        <!-- 带下划线的文字，前面加上图标 -->
        <span
          style="cursor: pointer; text-decoration: underline; color: #007BFF; font-size: 14px; display: inline-flex; align-items: center; margin-left: 10px;"
          @click="showFlowChart"
        >
          <!-- 图标 -->
          <i class="el-icon-info" style="margin-right: 5px;">设备如何反控？</i>
        </span>
      </el-col>

      <el-col :span="12">
        <right-tool-bar-go-back :showSearch.sync="showSearch" @queryTable="getList" :back="back"></right-tool-bar-go-back>
      </el-col>
    </el-row>

    <!-- 流程图组件 -->
    <FlowChartImage
      :flowChartSrc="flowChartSrc"
      :visible.sync="isFlowChartVisible"
    />

    <!-- 警告框，数据不正常时显示，带渐显效果 -->
    <transition name="fade">
      <div v-if="showAlert" class="alert-box">数据异常：采集数据无更新！</div>
    </transition>

    <el-table v-loading="loading" :data="tableData" :header-cell-style="headerCellStyle()" :cell-style="bodyCellStyle()"
      :style="tableStyle()">
      <el-table-column prop="factoryName" label="厂区" align="center" min-width="80" fit></el-table-column>
      <el-table-column prop="groupName" label="车间" align="center" min-width="100" fit></el-table-column>
      <el-table-column prop="deviceType" label="设备类型" align="center" min-width="60" fit></el-table-column>
      <el-table-column prop="eqId" label="设备编号" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="simId" label="盒子号" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="mcId" label="机台号" align="center" min-width="120" fit></el-table-column>
      <el-table-column prop="dt" label="最后采集时间" align="center" min-width="160" fit></el-table-column>
      <el-table-column prop="netStatus" label="联网状态" align="center" min-width="80" fit>
        <template slot-scope="scope">
          <span
            :style="getNetStatusStyle(scope.row.netStatus)"
            class="net-status-label">
            <i :class="getNetStatusIcon(scope.row.netStatus)" style="margin-right: 4px;"></i>
            {{ getNetStatusName(scope.row.netStatus) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="remoteStatus" label="远程功能" align="center" min-width="80" show-overflow-tooltip>
        <template slot="header">
          <span>远程功能</span>
          <el-tooltip class="item" effect="dark" placement="top-start" content="远程功能为[未知]的，是因未采集到机台的远程参数导致，后台无法判断当前机台的远程功能是否开启。可由人工确认机台的远程功能。">
            <i class="el-icon-question" style="color:#272728; margin-left:2px;'"> </i>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <dict-tag :options="dict.type.remote_control_status" :value="scope.row.remoteStatus" />
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script>
import { headerCellStyle, bodyCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles';
import { listEqStatus, listOfflineEqs } from '@/api/biz/eqn/networking'
import { fetchEqnFactoryNames, fetchEqnGroupNames } from '@/api/biz/common/factoryAndGroupNames'
import { fetchDataStatus } from '@/api/biz/common/eqRelated'
import RightToolBarGoBack from '@/views/biz/common/RightToolBarGoBack'
import FlowChartImage from '@/views/biz/eqn/networking/FlowChartImage'

export default {
  components: { RightToolBarGoBack, FlowChartImage },
  dicts: ['remote_control_status'],
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
      // 厂选择器
      factoryNameOptions: [],
      // 区选择器
      groupNameOptions: [],
      deviceTypeOptions: [{ name: 'DB', id: '1'}, { name: 'WB', id: '2'}, { name: 'HM', id: '3'}, { name: 'AA', id: '4'}],
      netStatusOptions: [{ name: '在线', id: '1'}, { name: '离线', id: '0' }],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        deviceType: null,
        eqId: null,
        mcId: null,
        simId: null,
        netStatus: null,
        remoteStatus: null,

      },
      // 数据状态变量
      showAlert: false,
      rules: {},

      isFlowChartVisible: false, // 控制流程图显示状态
      flowChartSrc: require("@/assets/biz/flow-chart.png"), // 流程图的图片路径

    }
  },

  created() {
    const netStatus = this.$route.query.netStatus
    const remoteStatus = this.$route.query.remoteStatus
    if (netStatus) {
      this.queryParams.netStatus = netStatus

      this.queryParams.factoryName = this.$route.query.factoryName
      this.queryParams.groupName = this.$route.query.groupName
      this.queryParams.deviceType = this.$route.query.deviceType
      this.back = true
    }
    if (remoteStatus) {
      this.queryParams.remoteStatus = remoteStatus
    }
  },

  mounted() {
    this.getList()
    this.getFactoryNames();

    // 在组件挂载时启动定时器
    this.checkDataStatus();
    this.intervalId = setInterval(this.checkDataStatus, 5000);
  },

  beforeDestroy() {
    // 在组件销毁前清除定时器
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },

  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,

    getList() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.loading = true
          listEqStatus(this.queryParams).then(response => {
            this.tableData = response.rows
            this.total = response.total
            this.loading = false;
          })
        }
      })
    },

    listOfflineEqs() {
      this.loading = true
      listOfflineEqs(this.queryParams).then(response => {
        this.tableData = response.rows
        this.total = response.total
        this.loading = false
      })
    },

    checkDataStatus() {
      this.getDataStatus().then(isDataNormal => {
        console.log('isDataNormal: ', isDataNormal)
        this.showAlert = isDataNormal === false;
      });
    },

    getDataStatus() {
      return fetchDataStatus(null).then(response => response.data);
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    reset() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        deviceType: null,
        eqId: null,
        mcId: null,
        simId: null,
        netStatus: null,
        remoteStatus: null,
        label: null,
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
          fetchEqnFactoryNames().then(response => {
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
          this.groupNameOptions = []
          fetchEqnGroupNames(this.queryParams).then(response => {
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

    /** 导出 */
    handleExport() {
      this.download('/eqn/eq/export', {
        ...this.queryParams
      }, `设备联网情况明细_${new Date().getTime()}.xlsx`)
    },

    /** 重置按钮操作 */
    resetQuery() {
      if (this.$route.query.label !== undefined) {
        this.reset()
        this.back = false
      } else {
        this.resetForm("queryForm");
      }
      this.handleQuery();
    },

    getNetStatusStyle(status) {
      // 不同状态对应不同的背景色和字体颜色
      switch (status) {
        case 0:  // 异常
          return {
            backgroundColor: '#ffebee', // 浅红色背景
            color: '#c62828', // 深红色字体
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'inline-block'
          };
        case 1:  // 正常
          return {
            backgroundColor: '#e8f5e9', // 浅绿色背景
            color: '#2e7d32', // 深绿色字体
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'inline-block'
          };
        default: // 未连接
          return {
            backgroundColor: '#eceff1', // 浅灰色背景
            color: '#607d8b', // 深灰色字体
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'inline-block'
          };
      }
    },

    getNetStatusIcon(status) {
      // 不同状态显示的图标
      switch (status) {
        case 0:
          return 'el-icon-circle-close'; // 红色叉号图标
        case 1:
          return 'el-icon-circle-check'; // 绿色对勾图标
        default:
          return 'el-icon-minus'; // 灰色横杠
      }
    },

    getNetStatusName(status) {
      const statusOption = this.netStatusOptions.find(option => option.id === String(status));
      return statusOption ? statusOption.name : '未知状态';
    },

    showFlowChart() {
      this.isFlowChartVisible = true; // 显示弹窗
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

.net-status-label {
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
}

#flow-chart {
  margin-top: 10px;
}
</style>
