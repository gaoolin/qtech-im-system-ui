<template>
  <div class="app-container dashboard">
    <!-- 顶部统计数据 -->
    <div class="header-stats">
      <div v-for="(stat, index) in stats" :key="index" class="stat-card">
        <div class="stat-header">
          <h3>{{ stat.label }}</h3>
        </div>
        <p>{{ stat.value }}</p>
        <div class="stat-change">
          <small :class="stat.change === 0 ? 'not-change' : stat.change > 0 ? 'increase' : 'decrease'">
            <!-- 根据变化显示上升或下降箭头 -->
            <span v-if="stat.change > 0" class="change-icon">⬆</span>
            <span v-if="stat.change < 0" class="change-icon">⬇</span>
            {{ stat.change }}%
          </small>
        </div>
        <div class="progress-bar">
          <div
              class="progress"
              :style="{ width: stat.progress + '%' }"
              @mouseover="showProgress(stat.progress)"
              @mouseleave="hideProgress"
          ></div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="content">
      <!-- 左侧信息卡片 -->
      <div class="left-panel">
        <div class="info-card" v-for="item in infoCards" :key="item.label">
          <div class="info-content">
            <div class="info-label">{{ item.label }}</div>
            <div class="info-value" :data-value="item.value">{{ item.value }}</div>
          </div>
        </div>
      </div>

      <!-- 中央图表 -->
      <div class="main-charts">
        <!-- 历史数据对比柱状图 -->
        <div class="chart-container chart-bar">
          <e-charts-bar-chart :bar-data="this.barData" :title="`历史数据比对`" />
        </div>

        <!-- 环形比例图 -->
        <div class="chart-container chart-pie">
          <e-charts-pie-chart :pie-data="this.pieData" :title="`点检比例`" />
        </div>
      </div>

      <!-- 右侧任务和异常提醒 -->
      <div class="right-panel">
        <div class="task-list card">
          <h3>异常待处理</h3>
          <ul>
            <li v-for="task in tasks" :key="task.id">
              {{ task.name }} - <span :class="getStatusClass(task.status)">{{ task.status }}</span>
            </li>
          </ul>
        </div>

        <!-- 异常提醒区域 -->
        <div class="alerts">
          <h3>异常提醒</h3>
          <div class="scroll-container" ref="scrollContainer">
            <ul class="scroll-list" ref="scrollList">
              <li v-for="alert in alerts" :key="alert.id">
                {{ alert.message }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  components: {
    EChartsBarChart: () => import('./EChartsBarChart.vue'),
    EChartsPieChart: () => import('./EChartsPieChart.vue')
  },
  data() {
    return {
      stats: [
        { label: '台虹厂区', value: 2341, change: -12, progress: 80, icon: 'path/to/icon1.png' },
        { label: '古一厂区', value: 1231, change: 9, progress: 60, icon: 'path/to/icon2.png' },
        { label: '古二厂区', value: 578, change: 0, progress: 42, icon: 'path/to/icon3.png' },
        { label: '汉浦厂区', value: 612, change: 56, progress: 55, icon: 'path/to/icon3.png' },
        { label: '印度厂区', value: 789, change: -89, progress: 5, icon: 'path/to/icon3.png' }
      ],
      infoCards: [
        { label: '台虹厂区', value: '1000次点检' },
        { label: '古一厂区', value: '1500次点检' },
        { label: '古二厂区', value: '1200次点检' }
      ],
      tasks: [
        { id: 1, name: '台虹厂区', status: '进行中' },
        { id: 2, name: '古一厂区', status: '未开始' },
        { id: 3, name: '古二厂区', status: '完成' }
      ],
      alerts: [
        { id: 1, message: '设备1温度异常' },
        { id: 2, message: '设备2未按时点检' },
        { id: 3, message: '设备3未按时点检' },
        { id: 4, message: '设备4未按时点检' },
        { id: 5, message: '设备5未按时点检' },
        { id: 6, message: '设备6未按时点检' }
      ],
      pieData: [
        { value: 42, name: '正常' },
        { value: 35, name: '异常' },
        { value: 23, name: '未处理' },
      ],
      barData: {
        days: ['1月', '2月', '3月', '4月', '5月', '6月'],
        normal: [10, 22, 28, 23, 15, 20],
        abnormal: [5, 8, 12, 9, 6, 10]
      },
      scrollSpeed: 10 // 滚动一轮所需的时间（秒）
    }
  },
  methods: {
    getStatusClass(status) {
      if (status === '进行中') return 'in-progress'
      if (status === '未开始') return 'not-started'
      if (status === '完成') return 'completed'
    },

    startScrolling() {
      const scrollList = this.$refs.scrollList
      const scrollContainer = this.$refs.scrollContainer

      const listHeight = scrollList.offsetHeight // 获取整个列表的高度
      const containerHeight = scrollContainer.offsetHeight // 容器的高度

      const scrollDuration = (listHeight / containerHeight) * this.scrollSpeed

      // 设置滚动时间，并应用动画
      scrollList.style.animationDuration = `${scrollDuration}s`
      scrollList.classList.add('scrolling') // 开始滚动
    },

    showProgress(progress) {
      // 添加显示进度百分比的逻辑
      console.log(`当前进度：${progress}%`);
    },

    hideProgress() {
      // 隐藏进度条显示逻辑
    }
  },
  mounted() {
    this.startScrolling()
  }
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.stat-header h3 {
  font-family: 'Din-Black', sans-serif;
  font-weight: bolder;
}

.stat-card {
  width: 18%;
  padding: 20px;
  background: linear-gradient(145deg, #f0f0f0, #ffffff);
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 24px;
  height: 24px;
}

.stat-card h3 {
  font-family: 'Din-Black', sans-serif;
  font-size: 18px;
  margin: 0;
}

.stat-card p {
  font-family: 'Din-Black', sans-serif;
  font-size: 36px;
  margin: 10px 0;
}

.stat-change {
  font-family: 'Din-Black', sans-serif;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card small {
  font-family: 'Din-Black', sans-serif;
  font-size: 15px;
}

.increase {
  color: #3cba54;
}

.decrease {
  color: #db3236;
}

.not-change {
  color: #999;
}

.change-icon {
  margin-right: 5px;
  font-weight: bolder;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
}

.progress {
  height: 100%;
  background-color: #4caf50;
}

.content {
  display: flex;
  gap: 20px;
}

.left-panel {
  width: 20%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-card {
  background: #fff;
  border-radius: 8px;
  margin-top: 10px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100px;
}

.info-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.info-label {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: left;
}

.info-value {
  font-size: 16px;
  font-weight: normal;
  color: #666;
  text-align: right;
}

.info-value[data-value="1000次点检"] {
  color: #db3236; /* 红色 */
}

.info-value[data-value="1500次点检"] {
  color: #f4c20d; /* 黄色 */
}

.info-value[data-value="1200次点检"] {
  color: #3cba54; /* 绿色 */
}

.main-charts {
  display: flex;
  gap: 20px;
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chart-bar {
  flex: 2 1 0;
  padding: 5px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chart-pie {
  flex: 1 1 0;
  height: 100%; /* 确保高度占满 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.right-panel {
  width: 20%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-list, .alerts {
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.scroll-container {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.scroll-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scrolling {
  animation: scroll 10s linear infinite;
}

@keyframes scroll {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100%);
  }
}

.in-progress {
  color: #f4c20d;
}

.not-started {
  color: #db3236;
}

.completed {
  color: #3cba54;
}

@font-face {
  font-family: 'Din-Black';
  src: url('../../../../assets/fonts/DINCond-Black.woff2') format('opentype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

</style>
