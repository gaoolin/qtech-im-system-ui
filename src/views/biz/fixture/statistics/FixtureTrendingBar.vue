<template>
  <div :class="className" :style="{height:height, width:width}" />
</template>

<script>
import * as echarts from 'echarts';
require('echarts/theme/macarons') // echarts theme
import resize from '@/views/dashboard/mixins/resize'

export default {
  name: 'FixtureTrendingBar',
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
      default: '450px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    fixtureTrendingBarData: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      chart: null,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
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
    setOptions() {
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          // formatter: '{a} <br/>{b} <br/>{c}',
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ['line', 'bar']},
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        legend: {
          data: ['Pogopin', 'AA', '锁附'],
        },
        xAxis: [{
          type: 'category',
          name: '周次',
          nameGap: '30',
          nameLocation: 'center',
          data: ['2023-47', '2023-48', '2023-49', '2023-50', '2023-51', '2023-52'],
          axisPointer: {
            type: 'shadow'
          }
        }],
        yAxis: [{
          type: 'value',
          name: '机型/料号(件)',
          min: 0,
          axisLabel: {
            formatter: '{value}'
          }
        }, {
          type: 'value',
          name: '共用率',
          min: 0,
          axisLabel: {
            formatter: '{value} %'
          }
        }],
        series: [{
          name: 'Pogopin',
          type: 'bar',
          stack: '新增机型',
          label: {
            show: true
          },
          tooltip: {
            valueFormatter: function(value) {
              return '新增机型' + value + '件';
            }
          },
          data: [10,11,12,13,14,15]
        }, {
          name: 'Pogopin',
          type: 'bar',
          stack: '新增料号',
          label: {
            show: true
          },
          tooltip: {
            valueFormatter: function(value) {
              return '新增料号' + value + '件';
            }
          },
          data: [55,56,57,58,59,60]
        }, {
          name: 'AA',
          type: 'bar',
          stack: '新增机型',
          label: {
            show: true
          },
          tooltip: {
            valueFormatter: function(value) {
              return '新增机型' + value + '件';
            }
          },
          data: [16,17,18,19,20,21]
        }, {
          name: 'AA',
          type: 'bar',
          stack: '新增料号',
          label: {
            show: true
          },
          tooltip: {
            valueFormatter: function(value) {
              return '新增料号' + value + '件';
            }
          },
          data: [50,51,52,53,54,55]
        }, {
          name: '锁附',
          type: 'bar',
          stack: '新增机型',
          label: {
            show: true
          },
          tooltip: {
            valueFormatter: function(value) {
              return '新增机型' + value + '件';
              }
            },
            data: [22,23,24,25,26,27]
        }, {
          name: '锁附',
          type: 'bar',
          stack: '新增料号',
          label: {
            show: true,
            color: 'red',
            weight: 'bolder'
          },
          tooltip: {
            valueFormatter: function(value) {
              return '新增料号' + value + '件';
            }
          },
          data: [56,57,58,59,60,61]
        }, {
          name: '共用率',
          yAxisIndex: 1,
          type: 'line',
          label: {
            show: true
          },
          tooltip: {
            valueFormatter: function(value) {
              return value + '%';
            }
          },
          data: [28,29,30,31,32,33]
        }],
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
