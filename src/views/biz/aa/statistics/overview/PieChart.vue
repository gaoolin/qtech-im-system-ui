<template>
  <div class="pie-chart-container" ref="pieChart"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  props: {
    pieData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      pieChartInstance: null // 保存 ECharts 实例
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.drawPieChart(); // 确保 DOM 渲染后再绘制图表
    });
    window.addEventListener('resize', this.resizePieChart);
  },
  beforeDestroy() {
    this.disposePieChart(); // 销毁图表实例
    window.removeEventListener('resize', this.resizePieChart);
  },
  methods: {
    drawPieChart() {
      // 销毁现有的实例以避免重复初始化
      if (this.pieChartInstance) {
        this.pieChartInstance.dispose();
      }
      this.pieChartInstance = echarts.init(this.$refs.pieChart);
      this.pieChartInstance.setOption({
        title: {
          text: '异常点检占比',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '点检状态',
            type: 'pie',
            radius: '50%',
            data: this.pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2
            }
          }
        ]
      });
    },
    resizePieChart() {
      if (this.pieChartInstance) {
        this.pieChartInstance.resize();
      }
    },
    disposePieChart() {
      if (this.pieChartInstance) {
        this.pieChartInstance.dispose();
      }
    }
  }
};
</script>

<style scoped>
.pie-chart-container {
  height: 400px; /* 适当设置容器高度 */
  width: 100%; /* 确保宽度为 100% */
}
</style>
