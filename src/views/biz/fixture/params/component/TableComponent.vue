<template>
  <div class="table-container">
    <el-table :data="tableData" border stripe>
      <el-table-column prop="id" label="序号" width="80" />
      <el-table-column prop="fixtureNo" label="治具编号" />
      <el-table-column prop="fixtureType" label="治具类型" />
      <el-table-column prop="status" label="状态" />
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      @current-change="changePage"
    />
  </div>
</template>

<script>
export default {
  props: {
    tableData: { type: Array, required: true },
    pagination: { type: Object, required: true },
  },
  methods: {
    changePage(page) {
      this.$emit("onPageChange", page);
    },
  },
};
</script>
