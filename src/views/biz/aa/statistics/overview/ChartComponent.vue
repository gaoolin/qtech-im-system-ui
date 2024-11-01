<template>
  <div class="chart-container" ref="chart"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  props: {
    chartData: {
      type: Object,
      required: true
    },
    activeTab: {
      type: Boolean, // 用于监控当前标签页是否激活
      required: true
    }
  },
  data() {
    return {
      chartInstance: null
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (this.activeTab) {
        this.drawChart(); // 仅在标签页激活时绘制图表
      }
    });
    window.addEventListener('resize', this.resizeChart);
  },
  watch: {
    activeTab(newVal) {
      if (newVal && !this.chartInstance) {
        this.$nextTick(() => {
          this.drawChart(); // 如果图表未初始化且当前标签激活，则初始化图表
        });
      } else if (newVal && this.chartInstance) {
        this.$nextTick(() => {
          this.chartInstance.resize(); // 当标签页重新激活时调整图表尺寸
        });
      }
    }
  },
  beforeDestroy() {
    this.disposeChart();
    window.removeEventListener('resize', this.resizeChart);
  },
  methods: {
    drawChart() {
      // 防止多次初始化
      if (this.chartInstance) {
        this.chartInstance.dispose();
      }
      const chartDom = this.$refs.chart;
      const width = chartDom.clientWidth;
      const height = chartDom.clientHeight;

      if (width === 0 || height === 0) {
        // 如果宽度或高度为 0，推迟初始化
        console.warn('Chart container size is 0, retrying initialization...');
        setTimeout(this.drawChart, 100); // 100ms 后重试初始化
        return;
      }

      this.chartInstance = echarts.init(chartDom);
      this.chartInstance.setOption({
        title: {
          text: '点检结果趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.chartData.days
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '正常点检',
            type: 'line',
            data: this.chartData.normal
          },
          {
            name: '异常点检',
            type: 'line',
            data: this.chartData.abnormal
          }
        ]
      });
    },
    resizeChart() {
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    },
    disposeChart() {
      if (this.chartInstance) {
        this.chartInstance.dispose();
      }
    }
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%; /* 确保容器宽度为 100% */
  height: 400px; /* 设置合理的高度 */
}
</style>
