<template>
  <div ref="barChart" style="width: 100%; height: 100%;"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  props: {
    barData: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      default: '',
      required: false
    }
  },
  data() {
    return {
      barChartInstance: null, // 保存 ECharts 实例
    };
  },
  methods: {
    initChart() {
      // 销毁现有的实例以避免重复初始化
      if (this.barChartInstance) {
        this.barChartInstance.disposeChart();
      }
      this.barChartInstance = echarts.init(this.$refs.barChart);
      const option = {
        title: { text: '历史数据对比' },
        tooltip: {},
        xAxis: { data: this.barData.days },
        yAxis: {},
        series: [
          {
            name: '点检次数',
            type: 'bar',
            data: this.barData.normal,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ]),
            },
            label: {
              show: true,
              position: 'top',
            },
          },
        ],
      };
      this.barChartInstance.setOption(option);
    },
    resize() {
      if (this.barChartInstance) {
        this.barChartInstance.resize();
      }
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resize);
    },
    disposeChart() {
      if (this.barChartInstance) {
        this.barChartInstance.dispose();
        this.barChartInstance = null;
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.initChart(); // 确保 DOM 渲染后再绘制图表
      window.addEventListener('resize', this.resize)
    });
  },
};
</script>
