<template>
  <div class="dashboard-editor-container">
    <panel-group :panel-data="panelData" />

    <el-row style="background:#fff; padding:16px 16px 0; margin-bottom:32px;">
      <bar-chart :chart-data="barChartData"/>
    </el-row>
  </div>
</template>

<script>
import { getWbOlpIndexOverview, getWbOlpIndexTrending } from '@/api/biz/wb/index'
import WbOlpIndexOverview from './WbOlpIndexOverview'
import WbOlpTrending from './WbOlpTrending'

export default {
  name: 'Index',
  components: {
    'bar-chart': WbOlpTrending,
    'panel-group': WbOlpIndexOverview
  },

  data() {
    return {
      barChartData: {
        data0: [],
        data1: [],
        data2: [],
        data3: [],
        data4: [],
        data5: []
      },
      panelData: {
        modTtl: 0,
        modAvgLine: 0,
        ttlWbOlpCnt: 0,
        ttlInterceptCnt: 0
      }
    }
  },

  methods: {
    updateIndexOverviewData() {
      getWbOlpIndexOverview().then(response => {
        this.$set(this.panelData, 'modTtl', response.data.wbOlpStdModelsTtlCnt)
        this.$set(this.panelData, 'modAvgLine', response.data.wbOlpStdModelAvgCnt)
      })
    },

    updateIndexTrendingData() {
      getWbOlpIndexTrending().then(response => {
        let xAxisDataTmp = []
        let xAxisData
        let data0 = []
        let data1 = []
        let data2 = []
        let data3 = []
        let data4 = []
        let data5

        let a, b, c, d, e

        for (let i = 0; i < response.rows.length; i++) {
          xAxisDataTmp.push(response.rows[i].date)
        }

        xAxisData = Array.from(new Set(xAxisDataTmp))

        data5 = xAxisData

        for (const xAxisDatum of xAxisData) {

          a = 0
          b = 0
          c = 0
          d = 0
          e = 0

          for (const datum of response.rows) {

            if (datum.date === xAxisDatum && datum.code === 0) {
              data0.push(datum.cnt)
              a++
            }
            if (datum.date === xAxisDatum && datum.code === 1) {
              data1.push(datum.cnt)
              b++
            }
            if (datum.date === xAxisDatum && datum.code === 2) {
              data2.push(datum.cnt)
              c++
            }
            if (datum.date === xAxisDatum && datum.code === 3) {
              data3.push(datum.cnt)
              d++
            }
            if (datum.date === xAxisDatum && datum.code === 4) {
              data4.push(datum.cnt)
              e++
            }
          }

          if (a === 0) {
            data0.push(0)
          }
          if (b === 0) {
            data1.push(0)
          }
          if (c === 0) {
            data2.push(0)
          }
          if (d === 0) {
            data3.push(0)
          }
          if (e === 0) {
            data4.push(0)
          }
        }

        this.barChartData.data0 = data0
        this.barChartData.data1 = data1
        this.barChartData.data2 = data2
        this.barChartData.data3 = data3
        this.barChartData.data4 = data4
        this.barChartData.data5 = data5

        let ttl_0 = this.sum(data0)
        let ttl = this.sum(data0) + this.sum(data1) + this.sum(data2) + this.sum(data3) + this.sum(data4)

        this.$set(this.panelData, 'ttlWbOlpCnt', ttl)
        this.$set(this.panelData, 'ttlInterceptCnt', ttl - ttl_0)
        this.loading = false
      })
    },

    doIt() {
      this.updateIndexOverviewData()
      this.updateIndexTrendingData()
    },

   sum(arr) {
     let total = 0;
     arr.forEach(ele => {
     total += ele;
     });
     return total;
   }
  },

  created() {
    this.doIt()
  },
}

</script>

<style lang="scss" scoped>
::v-deep .el-table {
  margin-top: 5px;
}

::v-deep .el-form-item {
  margin-top: 5px;
  margin-bottom: 5px !important;
}

.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
