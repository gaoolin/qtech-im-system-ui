<template>
  <div :class="className" :style="{height:height, width:width}" />
</template>

<script>
import * as echarts from 'echarts';
require('echarts/theme/macarons') // echarts theme
import resize from '@/views/dashboard/mixins/resize'

export default {
  name: 'FixtureTrendingLine',
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    },
    autoSize: {
      type: Boolean,
      default: true
    },
    fixtureTrendingLineData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null,
    }
  },
  watch: {
    fixtureTrendingLineData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    setOptions({data0, data1, data2, data3} = {}) {
      this.chart.setOption({
        title: {
          left: 'center',
          text: '共用率趋势图',
          subtext: '近半年数据'
        },
        tooltip: {
          trigger: 'axis',
          /*axisPointer: {
            type: 'cross',
            animation: false,
            label: {
              backgroundColor: '#ccc',
              borderColor: '#aaa',
              borderWidth: 1,
              shadowBlur: 0,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              color: '#222'
            }
          }*/
          padding: [5, 10]
        },
        legend: {
          left: 'left',
          data: ['Pogopin', 'AA', '锁附']
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          name: '周次',
          nameGap: '30',
          nameLocation: 'center',
          axisLine: { onZero: true},
          splitLine: { show: false },
          splitArea: { show: false },
          data: data0
        },

        yAxis: {
          type: 'value',
          name: '共用率',
          axisLabel: {
            formatter: '{value}%'
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return params.value.toFixed(1) + '%';
              }
            }
          },
        },
        series: [
          {
            name: 'Pogopin',
            type: 'line',
            smooth: true,
            emphasis: {
              focus: 'series'
            },
            tooltip: {
              valueFormatter: function(value) {
                return value.toFixed(2) + '%';
              }
            },
            data: data1
          },
          {
            name: 'AA',
            type: 'line',
            smooth: true,
            emphasis: {
              focus: 'series'
            },
            tooltip: {
              valueFormatter: function(value) {
                return value.toFixed(2) + '%';
              }
            },
            data: data2
          },
          {
            name: '锁附',
            type: 'line',
            smooth: true,
            emphasis: {
              focus: 'series'
            },
            tooltip: {
              valueFormatter: function(value) {
                return value.toFixed(2) + '%';
              }
            },
            data: data3
          },
        ]
      })
    },

    initChart() {
      this.chart = echarts.init(this.$el, 'macarons');
      this.setOptions();
    }
  }
}
</script>

<style scoped>

</style>
