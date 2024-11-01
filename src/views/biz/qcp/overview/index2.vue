<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <form id="queryForm" @submit.prevent="handleSubmit" class="row g-3 mb-4">
      <!-- 厂区 -->
      <div class="col-md-4">
        <label for="companyName" class="form-label">厂区</label>
        <select
            id="companyName"
            v-model="queryParams.companyName"
            @change="selectionFilter(queryParams)"
            class="form-select"
        >
          <option value="">请选择厂区</option>
          <option v-for="item in factoryOptions" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>

      <!-- 车间 -->
      <div class="col-md-4">
        <label for="groupName" class="form-label">车间</label>
        <select
            id="groupName"
            v-model="queryParams.groupName"
            @change="selectionFilter(queryParams)"
            class="form-select"
        >
          <option value="">请选择车间</option>
          <option v-for="item in workshopOptions" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>

      <!-- 设备类型 -->
      <div class="col-md-4">
        <label for="deviceType" class="form-label">设备类型</label>
        <select
            id="deviceType"
            v-model="queryParams.deviceType"
            @change="selectionFilter(queryParams)"
            class="form-select"
        >
          <option value="">请选择设备类型</option>
          <option v-for="item in deviceTypeOptions" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>

      <!-- 提交按钮 -->
      <div class="col-12 text-end">
        <button type="submit" class="btn btn-primary">查询</button>
      </div>
    </form>

    <!-- 操作栏 -->
    <div class="row mb-4">
      <div class="col text-start">
        <span class="fw-bold">更新时间：</span>
        <span class="highlight">{{ updateDt }}</span>
      </div>
      <div class="col text-end">
        <button class="btn btn-outline-secondary me-2" @click="getList">
          刷新
        </button>
        <button class="btn btn-outline-primary" @click="handleExport">
          导出
        </button>
      </div>
    </div>

    <button type="button" class="btn btn-primary">Primary</button>
    <button type="button" class="btn btn-secondary">Secondary</button>
    <button type="button" class="btn btn-success">Success</button>
    <button type="button" class="btn btn-danger">Danger</button>
    <button type="button" class="btn btn-warning">Warning</button>
    <button type="button" class="btn btn-info">Info</button>
    <button type="button" class="btn btn-light">Light</button>
    <button type="button" class="btn btn-dark">Dark</button>

    <div>
      <button :class="['btn', 'btn-primary']">按钮</button>
    </div>

    <button type="button" class="btn btn-link">Link</button>

    <b-container>
      <b-button variant="primary">Bootstrap Button</b-button>
    </b-container>

    <!-- 表格 -->
    <table class="table table-hover table-bordered table-striped">
      <thead class="table-dark">
      <tr>
        <th rowspan="2">厂区</th>
        <th rowspan="2">车间</th>
        <th rowspan="2">设备类型</th>
        <th rowspan="2">设备总数</th>
        <th colspan="3">已联网</th>
        <th rowspan="2">未联网</th>
      </tr>
      <tr>
        <th>有QCP参数模版</th>
        <th>无QCP参数模版</th>
        <th>未开启远程</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="row in filterTableData" :key="row.id">
        <td>{{ row.companyName }}</td>
        <td>{{ row.groupName }}</td>
        <td>{{ row.deviceType }}</td>
        <td>{{ row.ttlEqs }}</td>
        <td>{{ row.ttlEqs - row.qcpParamsIsNull }}</td>
        <td>{{ row.qcpParamsIsNull }}</td>
        <td>{{ row.remoteControlOff }}</td>
        <td>{{ row.offlineEqs }}</td>
      </tr>
      <!-- 渲染合计行 -->
      <tr class="fw-bold">
        <td colspan="3" class="text-center">合计</td>
        <td>{{ tableFooterData.ttlEqs }}</td>
        <td>{{ tableFooterData.ttlEqs - tableFooterData.qcpParamsIsNull }}</td>
        <td>{{ tableFooterData.qcpParamsIsNull }}</td>
        <td>{{ tableFooterData.remoteControlOff }}</td>
        <td>{{ tableFooterData.offlineEqs }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>


<script>
import { arraySpanMethod, mergeAction } from '@/views/biz/common/js/utils'
import { getDataMaxTime, listQcpOverview } from '@/api/biz/qcp/parameters'
import { BButton, BAlert, BContainer } from 'bootstrap-vue';

export default {
  name: 'index',

  components: {
    BButton,
    BAlert,
    BContainer
  },

  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      loading: true,
      tableData: [],
      filterTableData: [],
      companyFilter: [],
      groupNameFilter: [],
      deviceTypeFilter: [],
      companyFilterTmp: [],
      groupNameFilterTmp: [],
      deviceTypeFilterTmp: [],
      // 厂选择器
      factoryOptions: [],
      // 区选择器
      workshopOptions: [],
      deviceTypeOptions: [],
      updateDt: '-',
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        companyName: '',
        groupName: '',
        deviceType: '',
        status: null,
        remoteControlOff: null
      },
      rules: {},
      // 需要合并项的列
      needMergeArr: [
        {
          colName: 'companyName',
          mergeCheckNames: ['companyName']
        },
        {
          colName: 'groupName',
          mergeCheckNames: ['companyName', 'groupName']
        }
      ],
      rowMergeArrs: {} // 包含需要一个或多个合并项信息的对象
    }
  },

  created() {
    if (this.beforeRouteEnter) {
    } else {
      this.getList()
      this.getDataMaxTime()
    }
  },

  methods: {

    getList() {
      this.loading = true
      listQcpOverview(this.queryParams).then(response => {
        this.tableData = response.rows
        this.filterTableData = this.tableData
        for (const re of this.filterTableData) {
          this.companyFilterTmp.push(re.companyName)
          this.groupNameFilterTmp.push(re.groupName)
          this.deviceTypeFilterTmp.push(re.deviceType)
        }

        const companySet = new Set(this.companyFilterTmp)
        const groupNameSet = new Set(this.groupNameFilterTmp)
        const deviceTypeSet = new Set(this.deviceTypeFilterTmp)
        this.factoryOptions = Array.from(companySet)
        this.workshopOptions = Array.from(groupNameSet)
        this.deviceTypeOptions = Array.from(deviceTypeSet)

        this.loading = false
      })
    },

    handleSubmit() {
      this.tableDataFilter(this.queryParams)
    },

    getDataMaxTime() {
      getDataMaxTime().then(response => {
        this.updateDt = response.data
      })
    },

    async selectionFilter(val) {
      await this.tableDataFilter(val)
      await this.updateSelectionElements(this.filterTableData)
    },

    tableDataFilter(val) {
      this.filterTableData = this.tableData.filter(function(data) {
        let a = false
        let b = false
        let c = false

        if (val.companyName !== '') {
          a = data.companyName === val.companyName
        } else {
          a = true
        }

        if (val.groupName !== '') {
          b = data.groupName === val.groupName
        } else {
          b = true
        }

        if (val.deviceType !== '') {
          c = data.deviceType === val.deviceType
        } else {
          c = true
        }
        return a && b && c
      })
    },

    updateSelectionElements(val) {
      this.groupNameFilterTmp = []
      this.deviceTypeFilterTmp = []
      for (const re of val) {
        this.groupNameFilterTmp.push(re.groupName)
        this.deviceTypeFilterTmp.push(re.deviceType)
      }
      const groupNameSetTmp = new Set(this.groupNameFilterTmp)
      const deviceTypeSetTmp = new Set(this.deviceTypeFilterTmp)
      this.workshopOptions = Array.from(groupNameSetTmp)
      this.deviceTypeOptions = Array.from(deviceTypeSetTmp)
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    restQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },

    /** 导出 */
    handleExport() {
      this.download('qcp/params/export', {
        ...this.queryParams
      }, `qcp参数概览_${new Date().getTime()}.xlsx`)
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    }
  },

  computed: {
    arraySpanMethod() {
      return (params) => {
        return arraySpanMethod(params, this.needMergeArr, (val, rowIndex, colData) => {
          return mergeAction(val, rowIndex, colData, this.rowMergeArrs)
        })
      }
    },
    // 计算合计
    tableFooterData() {
      const total = {
        companyName: '合计', // 合计行的第一列可以显示 "合计" 字样
        groupName: '',
        deviceType: '',
        ttlEqs: 0,
        onlineEqs: 0,
        qcpParamsIsNull: 0,
        remoteControlOff: 0,
        offlineEqs: 0
      }

      // 遍历表格数据，累计各列数值
      this.filterTableData.forEach(item => {
        total.ttlEqs += item.ttlEqs || 0
        total.onlineEqs += item.onlineEqs || 0
        total.qcpParamsIsNull += item.qcpParamsIsNull || 0
        total.remoteControlOff += item.remoteControlOff || 0
        total.offlineEqs += item.offlineEqs || 0
      })

      return total
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
