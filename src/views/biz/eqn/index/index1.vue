<template>
  <div class="dashboard-container">
    <!-- 信息卡区域 -->
    <div class="info-cards">
      <div v-for="(factory, index) in factories" :key="index1" class="info-card">
        <h3>{{ factory.name }}</h3>
        <p>设备总数: <span>{{ factory.deviceCount }}</span></p>
        <p>联网设备: <span>{{ factory.onlineCount }}</span></p>
        <p>未联网设备: <span>{{ factory.offlineCount }}</span></p>
        <p>远程功能开启设备: <span>{{ factory.remoteEnabled }}</span></p>
      </div>
    </div>

    <!-- 数据图表 -->
    <div class="chart-section">
      <div class="chart-container small">
        <h3>联网状态分布</h3>
        <div id="bar-chart" class="chart"></div>
      </div>
      <div class="chart-container small">
        <h3>远程功能开启比例</h3>
        <div id="pie-chart" class="chart"></div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <h3>设备详细信息</h3>
      <table class="info-table">
        <thead>
        <tr>
          <th @click="sortTable('factory')">厂区</th>
          <th @click="sortTable('workshop')">车间</th>
          <th @click="sortTable('deviceType')">设备类型</th>
          <th @click="sortTable('deviceName')">设备名称</th>
          <th @click="sortTable('online')">联网状态</th>
          <th @click="sortTable('remoteEnabled')">远程功能</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(device, index) in filteredDevices" :key="index1">
          <td>{{ device.factory }}</td>
          <td>{{ device.workshop }}</td>
          <td>{{ device.deviceType }}</td>
          <td>{{ device.deviceName }}</td>
          <td :class="device.online ? 'online' : 'offline'">
            {{ device.online ? '已联网' : '未联网' }}
          </td>
          <td :class="device.remoteEnabled ? 'remote-enabled' : 'remote-disabled'">
            {{ device.remoteEnabled ? '已开启' : '未开启' }}
          </td>
        </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </div>
  </div>
</template>
<script>
import * as echarts from "echarts";

export default {
  data() {
    return {
      factories: [
        { name: "古城厂区", deviceCount: 150, onlineCount: 120, offlineCount: 30, remoteEnabled: 80 },
        { name: "汉浦厂区", deviceCount: 200, onlineCount: 180, offlineCount: 20, remoteEnabled: 150 },
        { name: "台虹厂区", deviceCount: 180, onlineCount: 160, offlineCount: 20, remoteEnabled: 130 },
        { name: "印度厂区", deviceCount: 120, onlineCount: 100, offlineCount: 20, remoteEnabled: 90 },
      ],
      deviceDetails: [
        { factory: "古城厂区", workshop: "COB一区", deviceType: "DB", deviceName: "设备A", online: true, remoteEnabled: true },
        { factory: "汉浦厂区", workshop: "测试二区", deviceType: "FT", deviceName: "设备B", online: false, remoteEnabled: false },
        // 更多设备数据...
      ],
      currentPage: 1,
      itemsPerPage: 10,
      sortKey: "",
      sortOrder: 1, // 1: 升序, -1: 降序
    };
  },
  computed: {
    filteredDevices() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = this.currentPage * this.itemsPerPage;
      let sortedDevices = [...this.deviceDetails];
      if (this.sortKey) {
        sortedDevices.sort((a, b) => (a[this.sortKey] > b[this.sortKey] ? 1 : -1) * this.sortOrder);
      }
      return sortedDevices.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.deviceDetails.length / this.itemsPerPage);
    },
  },
  mounted() {
    this.initCharts();
  },
  methods: {
    initCharts() {
      // 初始化柱状图
      const barChart = echarts.init(document.getElementById("bar-chart"));
      barChart.setOption({
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: this.factories.map(f => f.name) },
        yAxis: { type: "value" },
        series: [
          { name: "已联网", data: this.factories.map(f => f.onlineCount), type: "bar", stack: "status" },
          { name: "未联网", data: this.factories.map(f => f.offlineCount), type: "bar", stack: "status" },
        ],
      });

      // 初始化饼图
      const pieChart = echarts.init(document.getElementById("pie-chart"));
      pieChart.setOption({
        tooltip: { trigger: "item" },
        series: [
          {
            type: "pie",
            radius: "50%",
            data: this.factories.map(f => ({ value: f.remoteEnabled, name: f.name })),
          },
        ],
      });
    },
    sortTable(key) {
      this.sortKey = key;
      this.sortOrder *= -1;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
  },
};
</script>
<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.info-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.info-card {
  flex: 1 1 18%;
  background: white;
  padding: 15px;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chart-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-container.small {
  flex: 1;
  height: 240px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.table-section {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.info-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table th,
.info-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}

.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}

.online {
  color: green;
}

.offline {
  color: red;
}

.remote-enabled {
  color: blue;
}

.remote-disabled {
  color: gray;
}
</style>
