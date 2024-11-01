<template>
  <div :class="className" :style="{ height: height, width: width }"/>
</template>

<script>
import * as echarts from 'echarts'
import 'echarts/theme/macarons' // 引入默认主题
import resize from '../../../dashboard/mixins/resize'

export default {
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
      default: '600px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
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
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el)
      this.setOptions(this.chartData)
    },
    setOptions({ data0, data1, data2, data3, data4, data5 } = {}) {
      // 插画风格渐变背景
      const backgroundColor = {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 1,
        colorStops: [
          { offset: 0, color: '#a0d8ef' }, // 浅蓝色
          { offset: 1, color: '#ffffff' }  // 白色
        ]
      }
      const lineGradient = {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: '#0072ff' },
          { offset: 1, color: '#00c6ff' }
        ]
      }

      this.chart.setOption({
        backgroundColor,
        title: {
          text: '打线图比对趋势',
          subtext: '近30天数据',
          left: 'center',
          textStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#333'
          },
          subtextStyle: {
            color: '#555'
          }
        },
        grid: {
          left: '3%',
          right: '3%',
          bottom: '10%', // 增加底部空间以放置图例
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          textStyle: {
            color: '#fff'
          },
          axisPointer: {
            type: 'none'
          }
        },
        legend: {
          data: ['OK', '金线偏移', '少线', '无程序', '多线'],
          bottom: '3%', // 图例放底部居中
          textStyle: {
            color: '#333' // 图例文字颜色
          }
        },
        xAxis: [
          {
            type: 'category',
            data: data5,
            boundaryGap: false, // 设置为false，以便X轴起点与Y轴重合
            axisLine: {
              lineStyle: {
                color: '#000000'
              }
            },
            axisTick: {
              show: true
            },
            axisLabel: {
              rotate: 45, // 设置倾斜角度
              textStyle: {
                color: '#000000' // 设置字体颜色
              }
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '正常数据',
            boundaryGap: [0, '5%'], // 在顶部留出 10% 的空间
            axisLine: {
              show: true,
              lineStyle: {
                color: '#000000'
              }
            },
            axisTick: {
              show: true
            }
            // splitLine: {
            //   lineStyle: {
            //     color: '#000000'
            //   }
            // }
          },
          {
            type: 'value',
            name: '异常数据',
            boundaryGap: [0, '50%'], // 在顶部留出 10% 的空间
            axisLine: {
              show: true,
              lineStyle: {
                color: '#f61c1c'
              }
            },
            axisTick: {
              show: true
            },
            splitLine: {
              lineStyle: {
                color: '#eee'
              }
            }
          }
        ],
        series: [
          {
            name: 'OK',
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            lineStyle: {
              width: 3,
              color: lineGradient
            },
            areaStyle: {
              color: lineGradient,
              opacity: 0.3
            },
            data: data0
          },
          {
            name: '金线偏移',
            type: 'line',
            smooth: true,
            yAxisIndex: 1, // 使用异常数据的Y轴
            lineStyle: {
              width: 2,
              color: '#f08a5d' // 警示色
            },
            data: data1
          },
          {
            name: '少线',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            lineStyle: {
              width: 2,
              color: '#b83b5e' // 警示色
            },
            data: data2
          },
          {
            name: '无程序',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            lineStyle: {
              width: 2,
              color: '#f9ed69' // 警示色
            },
            data: data3
          },
          {
            name: '多线',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            lineStyle: {
              width: 2,
              color: '#6a0572' // 警示色
            },
            data: data4
          }
        ]
      })
    }
  }
}
</script>
