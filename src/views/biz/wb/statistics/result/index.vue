<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="厂区" prop="factoryName">
        <el-select v-model="queryParams.factoryName" placeholder="请输入厂区" clearable @change="handleQuery">
          <el-option
            v-for="item in factoryOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select v-model="queryParams.groupName" placeholder="请输入车间" clearable @change="handleQuery" @focus="getGroupNames">
          <el-option
            v-for="item in groupNameOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备号" prop="eqId">
        <el-input
          v-model="queryParams.eqId"
          placeholder="请输入设备号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机台号" prop="mcId">
        <el-input
          v-model="queryParams.mcId"
          placeholder="请输入机型"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="盒子号" prop="simId">
        <el-input
          v-model="queryParams.simId"
          placeholder="请输入盒子号"
          clearable
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机型" prop="prodType">
        <el-input
          v-model="queryParams.prodType"
          placeholder="请输入机型"
          clearable
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请输入比对结果状态" clearable
                   :key="queryParams.category" @change="handleQuery"
        >
          <el-option
            v-for="dict in dict.type.comparison_result_code"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="查询类型" prop="category">
        <el-select v-model="queryParams.category" placeholder="请输入查询类型" clearable @change="handleRefresh">
          <el-option
            v-for="dict in dict.type.comparison_search_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="resultList"
      :key="refreshKey"
      :cell-style="bodyCellStyle()"
      :header-cell-style="headerCellStyle()"
      :style="tableStyle()"
    >
      <el-table-column type="index" label="序号" width="55" align="center" fixed/>
      <el-table-column prop="factoryName" label="厂区" align="center" fixed/>
      <el-table-column prop="groupName" label="车间" align="center" fixed/>
      <el-table-column prop="eqId" label="设备号" align="center" />
      <el-table-column prop="mcId" label="机台号" align="center" />
      <el-table-column prop="prodType" label="机型" align="center" />
      <el-table-column prop="simId" label="盒子号" align="center" />
      <el-table-column prop="dt" label="时间" align="center" v-if="this.queryParams.category==='0'" />
      <el-table-column prop="status" label="状态" align="center" v-if="this.queryParams.category==='0'" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.comparison_result_code" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" align="center" show-overflow-tooltip
                       v-if="this.queryParams.category==='0'" />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { headerCellStyle, bodyCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles';
import { listEqInfo, listWbComparison } from '@/api/biz/wb/result'
import { getGroupNames} from '@/api/biz/wb/index'

export default {
  name: 'index',
  dicts: ['comparison_result_code', 'comparison_search_type'],
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      resultList: [],
      refreshKey: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        factoryName: null,
        groupName: null,
        eqId: null,
        simId: null,
        mcId: null,
        prodType: null,
        status: null,
        category: '0'
      },
      factoryOptions: ['古城厂区', '台虹厂区', '汉浦厂区', 'QT_India'],
      groupNameOptions: [],
    }
  },

  created() {
    this.getList()
  },
  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,
    getList() {
      this.loading = true
      if (this.queryParams.category === '1') {
        listEqInfo(this.queryParams).then(response => {
          this.resultList = response.rows
          this.total = response.total
          this.loading = false
        })
      } else {
        listWbComparison(this.queryParams).then(response => {
          this.resultList = response.rows
          this.total = response.total
          this.loading = false
        })
      }
    },
    handleRefresh() {
      /* 在 Vue 中，每个组件都有一个唯一的 key 属性。当组件的 key 属性发生改变时，Vue 会视为这是一个新的组件，而不是复用之前的组件。这样就会触发组件的重新渲染，从而实现页面的刷新 */
      // 点击刷新按钮，改变 refreshKey 的值触发组件的重新渲染
      this.refreshKey++
      if (this.queryParams.category==='0') {
        this.queryParams.eqId=null;
        this.queryParams.mcId=null;
        this.queryParams.prodType=null;
      } else if (this.queryParams.category==='1') {
        this.queryParams.status=null;
      }
      this.getList()
    },

    getGroupNames() {
      this.groupNameOptions = []
      getGroupNames(this.queryParams).then(response => {
        let data = response.data
        for (const i in data) {
          this.groupNameOptions.push(data[i]['groupName'])
        }
      })
    },


    /** 强制刷新 */
    refresh() {
      this.$router.go(0);
    },

    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },

    handleExport() {
      if (this.queryParams.category === '1') {
        this.download('/wb/olp/chk/emsInfo/export', {
          ...this.queryParams
        }, `eqInfo_${new Date().getTime()}.xlsx`)
      } else if (this.queryParams.category === '0') {
        this.download('/wb/olp/chk/export', {
          ...this.queryParams
        }, `打线图比对结果信息_${new Date().getTime()}.xlsx`)
      }
    }
  }
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
</style>
