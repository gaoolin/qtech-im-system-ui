<template>
  <div>
    <!-- 顶部导航 -->
    <el-row class="header" type="flex" justify="space-between">
      <el-col :span="12">
        <h2>生产车间点检数据概览</h2>
      </el-col>
      <el-col :span="12" style="text-align: right;">
        <el-button type="primary">导出数据</el-button>
        <el-button type="success" @click="refreshData">刷新数据</el-button>
      </el-col>
    </el-row>

    <!-- 左侧树形控件和右侧数据概览 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <!-- 厂区和车间树形选择 -->
        <el-tree
            :data="factoryTree"
            show-checkbox
            default-expand-all
            node-key="id"
            @node-click="handleTreeClick"
        >
        </el-tree>
      </el-col>

      <el-col :span="18">
        <!-- 概览卡片 -->
        <el-row :gutter="20" class="overview-cards">
          <el-col :span="8">
            <el-card>
              <div class="card-header">
                <span>正常点检</span>
              </div>
              <div class="card-body">
                <h3>{{ normalCount }}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <div class="card-header">
                <span>异常点检</span>
              </div>
              <div class="card-body">
                <h3 @click="showAbnormalDetails">{{ abnormalCount }}</h3>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <div class="card-header">
                <span>正常率</span>
              </div>
              <div class="card-body">
                <h3>{{ normalRate }}%</h3>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 图表展示 -->
        <div class="chart-container">
          <el-tabs @tab-click="handleTabClick" v-model="activeTab">
            <el-tab-pane label="点检趋势">
<!--              <chart-component ref="chartComponent" :chart-data="chartData"></chart-component>-->
              <ChartComponent v-show="activeTab === 'tab1'" ref="chartComponent" :chartData="chartData" :activeTab="activeTab === 'tab1'" />

            </el-tab-pane>
            <el-tab-pane label="异常点检占比">
<!--              <pie-chart ref="pieChart" :pie-data="pieChartData"></pie-chart>-->
              <PieChart v-show="activeTab === 'tab2'" ref="pieChart" :pieData="pieChartData" :activeTab="activeTab === 'tab2'" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>

    <!-- 异常点检详细信息弹窗 -->
    <el-dialog title="异常点检详情" :visible.sync="dialogVisible" width="50%">
      <el-table :data="abnormalDetails">
        <el-table-column prop="time" label="时间" width="180"></el-table-column>
        <el-table-column prop="location" label="设备位置"></el-table-column>
        <el-table-column prop="issue" label="问题描述"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import ChartComponent from './ChartComponent.vue'
import PieChart from './PieChart.vue'

export default {
  name: 'Overview',
  data() {
    return {
      factoryTree: [
        {
          id: 1,
          label: '厂区1',
          children: [
            { id: 11, label: '车间A' },
            { id: 12, label: '车间B' }
          ]
        },
        {
          id: 2,
          label: '厂区2',
          children: [
            { id: 21, label: '车间C' },
            { id: 22, label: '车间D' }
          ]
        }
      ],
      normalCount: 320,
      abnormalCount: 45,
      normalRate: 88, // 正常率
      chartData: {
        normal: [80, 90, 100, 110, 120],
        abnormal: [5, 6, 3, 8, 10],
        days: ['周一', '周二', '周三', '周四', '周五']
      },
      pieChartData: [
        { value: 45, name: '异常点检' },
        { value: 320, name: '正常点检' }
      ],
      dialogVisible: false,
      abnormalDetails: [
        { time: '2024-10-16 08:30', location: '设备1', issue: '温度过高' },
        { time: '2024-10-16 10:00', location: '设备2', issue: '电流异常' }
      ],
      activeTab: 'tab1'
    }
  },
  methods: {
    handleTreeClick(node) {
      console.log('Clicked node:', node)
      // Mock: 根据选中的厂区/车间调整数据展示
    },
    showAbnormalDetails() {
      this.dialogVisible = true
    },
    refreshData() {
      // Mock: 刷新数据
      this.normalCount = Math.floor(Math.random() * 500)
      this.abnormalCount = Math.floor(Math.random() * 100)
      this.normalRate = Math.floor(Math.random() * 100)
    },
    handleTabClick(tab, event) {
      if (tab.label === '点检趋势') {
        this.activeTab = 'tab1'
        this.$refs.chartComponent.drawChart()
      } else if (tab.label === '异常点检占比') {
        this.activeTab = 'tab2'
        this.$refs.pieChart.drawPieChart()
      }
    }
  },
  components: {
    ChartComponent,
    PieChart
  }
}
</script>


<style scoped>
.header {
  margin-bottom: 20px;
}

.overview-cards .el-card {
  height: 150px;
}

.card-header {
  font-size: 18px;
  margin-bottom: 10px;
}

.card-body h3 {
  font-size: 24px;
  cursor: pointer;
}

.chart-container {
  margin-top: 20px;
  width: 100%;
  height: 400px;
  position: relative;
}
</style>
