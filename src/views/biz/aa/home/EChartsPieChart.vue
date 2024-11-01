<template>
  <div ref="pieChart" style="width: 100%; height: 100%;"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  props: {
    pieData: {
      type: Array,
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
      pieChartInstance: null, // 保存 ECharts 实例
    };
  },
  methods: {
    initChart() {
      // 销毁现有的实例以避免重复初始化
      if (this.pieChartInstance) {
        this.pieChartInstance.dispose();
      }
      this.pieChartInstance = echarts.init(this.$refs.pieChart);
      const option = {
        title: { text: this.title, left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { bottom: '5%' },
        series: [
          {
            name: this.title,
            type: 'pie',
            radius: ['40%', '70%'],
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
            },
          },
        ],
      };
      this.pieChartInstance.setOption(option);
    },
    resize() {
      if (this.pieChartInstance) {
        this.pieChartInstance.resize();
      }
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resize);
    },
    disposeChart() {
      if (this.pieChartInstance) {
        this.pieChartInstance.dispose();
        this.pieChartInstance = null;
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
