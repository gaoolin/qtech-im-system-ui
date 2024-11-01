<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="20" style="padding:8px 16px 0;">
        <fixture-block-group :block-data="fixtureBlockData"/>
    </el-row>
    <el-row :gutter="20" style="background:#fff; padding:8px 16px 0; margin-bottom:12px;">
        <fixture-panel v-if="flag" :fixture-panel-data="fixturePanelData"/>
    </el-row>
    <el-row :gutter="20" style="background:#fff; padding:8px 16px 0; margin-bottom:12px;">
      <fixture-trending-line :fixtureTrendingLineData="fixtureTrendingLineData" />
    </el-row>
  </div>
</template>

<script>
import FixturePanel from './FixturePanel'
import FixtureTrendingBar from './FixtureTrendingBar'
import { getFixturePanelData, getFixtureTrendingLineData } from '@/api/biz/fixture/fixture'
import FixtureTrendingLine from './FixtureTrendingLine'
import FixtureBlockGroup from './FixtureBlockGroup'
import PanelGroup from '@/views/dashboard/PanelGroup'

export default {
  name: 'index',
  components: { PanelGroup, FixturePanel, FixtureTrendingBar, FixtureTrendingLine, FixtureBlockGroup },
  data() {
    return {
      fixturePanelData: {},
      fixtureTrendingBarData: {},
      fixtureTrendingLineData: {
        data0: [],
        data1: [],
        data2: [],
        data3: [],
      },
      fixtureBlockData: {},
      flag: false
    }
  },
  methods: {
    getFixturePanelData() {
      getFixturePanelData().then(response => {
        let o2
        let o1
        for (let i = 0; i < response.data.length; i++) {
          if (response.data[i].deptId === 209) {
            o1 = {}
            o2 = {}
            this.$set(this.fixtureBlockData, 'pogopinCnt', response.data[i].ttlProdTypeCnt);
            o2.name = '共用治具';
            o2.value = response.data[i].sharedFixtureCnt;
            o1.name = '未共用治具';
            o1.value  = response.data[i].unSharedFixtureCnt;
            this.fixturePanelData['pogopin'] = [o1, o2];
          } else if (response.data[i].deptId === 210) {
            o1 = {}
            o2 = {}
            this.$set(this.fixtureBlockData, 'aaCnt', response.data[i].ttlProdTypeCnt);
            o2.name = '共用治具';
            o2.value = response.data[i].sharedFixtureCnt;
            o1.name = '未共用治具';
            o1.value  = response.data[i].unSharedFixtureCnt;
            this.fixturePanelData['aa'] = [o1, o2];
          } else if (response.data[i].deptId === 211) {
            o1 = {}
            o2 = {}
            this.$set(this.fixtureBlockData, 'lockCnt', response.data[i].ttlProdTypeCnt);
            o2.name = '共用治具';
            o2.value = response.data[i].sharedFixtureCnt;
            o1.name = '未共用治具';
            o1.value  = response.data[i].unSharedFixtureCnt;
            this.fixturePanelData['lock'] = [o1, o2]
          }
        }
        console.log(this.fixturePanelData)
        this.flag = true;
      })
    },

    getFixtureTrendingLineData() {
      getFixtureTrendingLineData().then(response => {
        let xAxisWeekTmp = []
        let xAxisWeek
        let data0
        let data1 = []
        let data2 = []
        let data3 = []

        for (let i = 0; i < response.rows.length; i++) {
          xAxisWeekTmp.push(response.rows[i].weekNum)
        }
        xAxisWeek = Array.from(new Set(xAxisWeekTmp))
        data0 = xAxisWeek

        for (let i = 0; i < response.rows.length; i++) {
          if (response.rows[i].deptId === 209) {
            data1.push(response.rows[i].sharedRatio * 100)
          } else if (response.rows[i].deptId === 210) {
            data2.push(response.rows[i].sharedRatio * 100)
          } else if (response.rows[i].deptId === 211) {
            data3.push(response.rows[i].sharedRatio * 100)
          }

          this.fixtureTrendingLineData.data0 = data0
          this.fixtureTrendingLineData.data1 = data1
          this.fixtureTrendingLineData.data2 = data2
          this.fixtureTrendingLineData.data3 = data3
        }
      })
    }
  },

  created() {
      this.getFixturePanelData();
      this.getFixtureTrendingLineData()
  }
}
</script>

<style lang="scss" scoped>
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
