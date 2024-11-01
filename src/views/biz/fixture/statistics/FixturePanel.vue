<template>
  <div :class="className" :style="{height:height, width:width}" />
</template>

<script>
import * as echarts from 'echarts';
require('echarts/theme/macarons') // echarts theme
import resize from '@/views/dashboard/mixins/resize'

export default {
  name: 'FixturePanel',
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
      default: '250px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    fixturePanelData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null,
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
    setOptions() {
      this.chart.setOption({
        title: [{
          text: '治具共用信息',
          x: 'center',
          y: 'center',
          top: '0',
          // 主标题样式
          textStyle: {
            fontSize: '18',
            color: 'black'
          },
        },
          {
            subtext: 'Pogopin',
            left: '14.5%',
            bottom: '3%',
            subtextStyle: {
              fontSize: '14',
              color: 'black'
            }
          },
          {
            subtext: 'AA',
            left: '50%',
            bottom: '3%',
            textAlign: 'center',
            subtextStyle: {
              fontSize: '14',
              color: 'black'
            }
          },
          {
            subtext: '锁附',
            left: '83%',
            bottom: '3%',
            textAlign: 'center',
            subtextStyle: {
              fontSize: '14',
              color: 'black'
            }
          },
        ],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'right',
          top: '10',
          data: ['共用治具', '未共用治具']
        },
        labelLine: {
          length: 15,
          length2: 0,
          maxSurfaceAngle: 80
        },
        calculable: true,
        series: [
          {
            name: 'Pogopin共用治具信息',
            type: 'pie',
            radius: ['30%', '60%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            label: {
              formatter: '{name|{b}}\n{value|{c} 件}',
              minMargin: 5,
              edgeDistance: 10,
              lineHeight: 15,
              rich: {
                value: {
                  fontSize: 12,
                  color: '#999'
                }
              }
            },

            data: this.fixturePanelData['pogopin'],
            animationEasing: 'cubicInOut',
            animationDuration: 2600,
            left: 0,
            right: '66.6667%',
            top: 0,
            bottom: 0
          },
          {
            name: 'AA共用治具信息',
            type: 'pie',
            radius: ['30%', '60%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            label: {
              formatter: '{name|{b}}\n{value|{c} 件}',
              minMargin: 5,
              edgeDistance: 10,
              lineHeight: 15,
              rich: {
                value: {
                  fontSize: 12,
                  color: '#999'
                }
              }
            },
            data:  this.fixturePanelData['aa'],
            animationEasing: 'cubicInOut',
            animationDuration: 2600,
            left: '33.3333%',
            right: '33.3333%',
            top: 0,
            bottom: 0
          },
          {
            name: '锁附共用治具信息',
            type: 'pie',
            radius: ['30%', '60%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            label: {
              formatter: '{name|{b}}\n{value|{c} 件}',
              minMargin: 5,
              edgeDistance: 10,
              lineHeight: 15,
              rich: {
                value: {
                  fontSize: 12,
                  color: '#999'
                }
              }
            },

            data:  this.fixturePanelData['lock'],
            animationEasing: 'cubicInOut',
            animationDuration: 2600,
            left: '66.6667%',
            right: 0,
            top: 0,
            bottom: 0
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
