<template>
  <div class="app-container center">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px" :rules="rules">
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
          <el-option v-for="dict in dict.type.aa_list_params_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
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

    <!-- 警告框，数据不正常时显示，带渐显效果 -->
    <transition name="fade">
      <div v-if="showAlert" class="alert-box">数据异常：采集数据无更新！</div>
    </transition>

    <el-table v-loading="loading" :data="resultList" :key="refreshKey" :header-cell-style="headerCellStyle()"
      :cell-style="bodyCellStyle()" :style="tableStyle()">
      <el-table-column type="index" label="序号" width="55" align="center" fixed />
      <el-table-column prop="factoryName" label="厂区" align="center" fixed />
      <el-table-column prop="groupName" label="车间" align="center" fixed />
      <el-table-column prop="eqId" label="设备号" align="center" />
      <el-table-column prop="mcId" label="机台号" align="center" />
      <el-table-column prop="prodType" label="机型" align="center" />
      <el-table-column prop="simId" label="盒子号" align="center" />
      <el-table-column prop="dt" label="点检时间" align="center" />
      <el-table-column prop="statusCode" label="状态" align="center">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.aa_list_params_status" :value="scope.row.statusCode" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" align="center" show-overflow-tooltip />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script>
import { bodyCellStyle, headerCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles'
import { listLatestCheckStatus } from '@/api/biz/aa/statistics/statistics'
import { dateToStr } from '@/views/biz/common/js/utils';
import { fetchAaDataStatus } from '@/api/biz/common/eqRelated'
import { fetchLatestFactoryNames, fetchLatestGroupNames } from '@/api/biz/common/factoryAndGroupNames'

export default {
  name: 'index.vue',
  dicts: ['aa_list_params_status'],

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
        statusCode: null
      },
      rules: {},
      showAlert: false,

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
          listLatestCheckStatus(this.queryParams).then(response => {
            this.resultList = response.rows
            this.total = response.total
            this.loading = false
          })
        }
      })
    },

    async checkDataStatus() {
      // 发送请求检查数据状态的函数
      const isDataNormal = await this.getDataStatus();
      if (isDataNormal === 'true') {
        this.showAlert = true // 数据不正常时显示红色提示框
      }
      this.showAlert = false
    },

    async getDataStatus() {
      // 请求逻辑
      const response = await fetchAaDataStatus(null); /* API 请求逻辑 */;
      return response.data;
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
      this.factoryNameOptions = []
      fetchLatestFactoryNames(this.queryParams).then(response => {
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
    },

    /** 获取车间列表 */
    getGroupNames() {
      this.groupNameOptions = []
      this.checkPreInput()
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          fetchLatestGroupNames(this.queryParams).then(response => {
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

    handleExport() {
      this.download('aa/params/latest/status/export', {
        ...this.queryParams
      }, `AA参数反控机台状态_${new Date().getTime()}.xlsx`)
    }
  },

  created() {
    // 每隔5秒检查数据状态
    this.checkDataStatus();
    // 在组件挂载时启动定时器
    this.intervalId = setInterval(() => {
      this.checkDataStatus();
    }, 5000); // 5秒
  },

  beforeDestroy() {
    // 在组件销毁前清除定时器
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },

  mounted() {
    this.getList()
    this.getFactoryNames(this.queryParams)
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
