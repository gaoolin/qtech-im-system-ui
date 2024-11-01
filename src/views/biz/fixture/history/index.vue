<template>
<div class="app-container">
  <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
    <el-form-item label="料号" prop="materialNmb">
      <el-input
        v-model="queryParams.materialNmb"
        placeholder="请输入料号"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item>
    <el-form-item label="机种" prop="prodType">
      <el-input
        v-model="queryParams.prodType"
        placeholder="请输入机种"
        clearable
        @keyup.enter.native="handleQuery"
      />
    </el-form-item>
    <el-form-item label="时段" required>
      <el-date-picker
        v-model="dateRangeCreateDate"
        style="width: 370px"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        @change="handleQuery"
      ></el-date-picker>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
      <el-button type="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
    </el-form-item>
  </el-form>

  <el-table
    v-loading="loading"
    :data="historyList"
    :header-cell-style="headerCellStyle()"
    :cell-style="bodyCellStyle()"
    :style="tableStyle()"
  >
    <el-table-column type="index" label="序号" width="55" align="center" fixed />
    <el-table-column label="料号" align="center" min-width="50" prop="materialNmb" fixed />
    <el-table-column label="品名" align="center" min-width="120" prop="fixtureName" fixed show-overflow-tooltip/>
    <el-table-column label="规格" align="center" min-width="120" prop="fixtureSpec" fixed show-overflow-tooltip/>
    <el-table-column label="机种" align="center" min-width="50" prop="prodType" fixed />
    <el-table-column label="治具类别" align="center" min-width="70" prop="fixtureCategory" fixed  show-overflow-tooltip>
      <template slot-scope="scope">{{scope.row.fixtureCategory}}</template>
    </el-table-column>
    <el-table-column label="治具版本" align="center" min-width="35" prop="fixtureVersion" />
    <el-table-column label="连接器朝向" align="center" min-width="35" prop="buckle" fixed>
      <template slot-scope="scope">
        <dict-tag :options="dict.type.fixture_buckle_status" :value="scope.row.buckle"/>
      </template>
    </el-table-column>
    <el-table-column label="创建人" align="center" min-width="35" prop="createBy" />
    <el-table-column label="创建时间" align="center" width="155" prop="createTime">
      <template slot-scope="scope">
        <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
      </template>
    </el-table-column>
    <el-table-column label="更新人" align="center" min-width="35" prop="updateBy" />
    <el-table-column label="更新时间" align="center" width="155" prop="updateTime">
      <template slot-scope="scope">
        <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
      </template>
    </el-table-column>
    <el-table-column label="类别" align="center" min-width="35" prop="deptId">
      <template slot-scope="scope">
        <dict-tag :options="dict.type.biz_fixture_project" :value="scope.row.deptId" />
      </template>
    </el-table-column>
    <el-table-column label="操作时间" align="center" width="155" prop="opsTime" />
    <el-table-column label="备注" align="center" min-width="50" prop="remark" show-overflow-tooltip />
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
import { pickerOptionsSet2 } from '@/views/biz/common/js/pickerOptionsConfig'
import { listHistory, getHistory, delHistory, addHistory, updateHistory } from "@/api/biz/fixture/history";
import { bodyCellStyle, headerCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles'
export default {
  name: 'History',
  dicts: ['fixture_buckle_status', 'biz_fixture_project'],
  data() {
    return {
      loading: true,
      ids: [],
      prodTypes: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      historyList: [],
      title: "",
      // 状态时间范围
      dateRangeCreateDate: [this.$dateToStr(new Date(new Date().valueOf() - 1 * 1440 * 60 * 1000)), this.$dateToStr(new Date(new Date().valueOf()))],
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        prodType: null,
        materialNmb: null,
      },
      form: {},
      rules: {},
      pickerOptions: pickerOptionsSet2,

    };
  },

  created() {
    this.getList();
  },
  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,

    getList() {
      this.loading = true;
      this.queryParams.params = {}
      if (null != this.dateRangeCreateDate && '' !== this.dateRangeCreateDate) {
        this.queryParams.params['beginCreateDate'] = this.dateRangeCreateDate[0]
        this.queryParams.params['endCreateDate'] = this.dateRangeCreateDate[1]
      }
      listHistory(this.queryParams).then(res => {
        this.historyList = res.rows;
        this.total = res.total;
        this.loading = false;
      });
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        hid: null,
        prodType: null,
        fixtureCategory: null,
        fixtureName: null,
        materialNmb: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        project: null,
        remark: null
      };
      this.resetForm("form");
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleExport() {
      this.download('/fixture/history/export', {
        ...this.queryParams
      }, `pogopin_history_${new Date().getTime}.xlsx`)
    },
  }
};
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
