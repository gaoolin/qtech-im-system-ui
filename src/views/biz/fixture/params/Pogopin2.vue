<template>
  <div class="app-container">
    <!-- 表单部分 -->
    <FormComponent :queryParams="queryParams" @onSearch="handleSearch" />

    <!-- 表格部分 -->
    <TableComponent
      :tableData="tableData"
      :pagination="pagination"
      @onPageChange="handlePageChange"
    />
  </div>
</template>
