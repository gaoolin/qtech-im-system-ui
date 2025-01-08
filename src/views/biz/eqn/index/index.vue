<template>
  <div class="app-container center">
    <ManufacturingVisualization :wireData="wireData" />
  </div>
</template>

<script>
import ManufacturingVisualization from "./ManufacturingVisualization.vue";

export default {
  components: {
    ManufacturingVisualization,
  },
  data() {
    return {
      wireData: [
        { line: 1, leadX: -4400.0503, leadY: -17181.8008, padX: -4000.9001, padY: -17371.7012 },
        { line: 2, leadX: -4399.3999, leadY: -16521.25, padX: -3995.05, padY: -16719.2012 },
        { line: 3, leadX: -4399.2002, leadY: -16372.5498, padX: -3995.1501, padY: -16617.3496 },
        { line: 4, leadX: -4399.0, leadY: -16224.0498, padX: -3990.25, padY: -16518.2012 },
        { line: 5, leadX: -4398.9502, leadY: -15810.1504, padX: -4001.3501, padY: -15833.5498 },
        { line: 6, leadX: -4398.6001, leadY: -15446.9004, padX: -3990.1001, padY: -15726.7002 },
        { line: 7, leadX: -4398.3999, leadY: -15086.9004, padX: -3989.8501, padY: -15275.4502 },
        { line: 8, leadX: -4397.5503, leadY: -14073.8506, padX: -3991.2, padY: -13894.4004 },
        { line: 9, leadX: -4397.25, leadY: -13713.9004, padX: -3986.5, padY: -13444.8506 },
        { line: 10, leadX: -4397.2002, leadY: -13354.0, padX: -3958.6501, padY: -13025.5498 },
        { line: 11, leadX: -4396.8999, leadY: -13086.4004, padX: -3969.8501, padY: -12775.5 },
        { line: 12, leadX: -4396.5503, leadY: -12642.9004, padX: -3990.55, padY: -12259.7002 },
        { line: 13, leadX: -5129.0, leadY: -12150.9502, padX: -4881.1499, padY: -11762.9502 },
        { line: 14, leadX: -5249.0, leadY: -12150.6006, padX: -5113.2002, padY: -11766.3506 },
        { line: 15, leadX: -6239.5, leadY: -12149.6006, padX: -5661.3003, padY: -11799.75 },
        { line: 16, leadX: -6609.6001, leadY: -12149.2998, padX: -6123.3003, padY: -11774.7002 },
        { line: 17, leadX: -7449.0, leadY: -12148.7002, padX: -7182.9502, padY: -11726.8506 },
        { line: 18, leadX: -7689.4502, leadY: -12148.5, padX: -7449.6499, padY: -11764.1006 },
        { line: 19, leadX: -8288.6006, leadY: -12147.7998, padX: -8261.6006, padY: -11753.0498 },
        { line: 20, leadX: -9248.1504, leadY: -12146.7998, padX: -9604.4004, padY: -11751.2002 },
        { line: 21, leadX: -9494.2002, leadY: -12146.7002, padX: -9846.75, padY: -11763.2002 },
        { line: 22, leadX: -9853.9004, leadY: -12146.6006, padX: -10270.3506, padY: -11767.8506 },
        { line: 23, leadX: -10093.7002, leadY: -12146.2002, padX: -10494.25, padY: -11764.7998 },
        { line: 24, leadX: -10507.6006, leadY: -12145.8506, padX: -10933.1006, padY: -11766.5 },
        { line: 25, leadX: -10825.4004, leadY: -12162.5, padX: -11414.8506, padY: -11730.3506 },
        { line: 26, leadX: -11475.0, leadY: -13106.0, padX: -11848.0498, padY: -12946.7998 },
        { line: 27, leadX: -11475.1006, leadY: -13563.9502, padX: -11851.9502, padY: -13421.4004 },
        { line: 28, leadX: -11475.7002, leadY: -14370.1504, padX: -11858.2002, padY: -14458.9004 },
        { line: 29, leadX: -11475.75, leadY: -14490.0498, padX: -11857.3506, padY: -14562.5498 },
        { line: 30, leadX: -11476.0, leadY: -14849.7002, padX: -11865.7002, padY: -14897.0498 },
        { line: 31, leadX: -11476.0498, leadY: -14969.8506, padX: -11862.7998, padY: -15001.6504 },
        { line: 32, leadX: -11476.4502, leadY: -15329.2998, padX: -11858.6006, padY: -15395.0498 },
        { line: 33, leadX: -11476.5498, leadY: -15656.25, padX: -11856.0, padY: -15626.7998 },
        { line: 34, leadX: -11476.8506, leadY: -16016.4004, padX: -11840.0, padY: -15972.6006 },
        { line: 35, leadX: -11477.0, leadY: -16136.2998, padX: -11850.2002, padY: -16220.0498 },
        { line: 36, leadX: -11477.2002, leadY: -16256.2998, padX: -11845.0, padY: -16312.6504 },
        { line: 37, leadX: -11477.3506, leadY: -16496.0, padX: -11841.6006, padY: -16542.3496 },
        { line: 38, leadX: -11477.25, leadY: -16616.1504, padX: -11842.7002, padY: -16785.3496 },
        { line: 39, leadX: -11477.7998, leadY: -16975.7012, padX: -11853.0, padY: -17207.7012 },
        { line: 40, leadX: -11477.9502, leadY: -17308.1504, padX: -11856.1504, padY: -17471.25 }
      ],
    }
  },

  methods: {
    fetchData() {
      // 异步获取或更新 wireData
      // this.wireData = fetchedData;  // 将新数据赋值给 wireData
    }
  }
};
</script>
