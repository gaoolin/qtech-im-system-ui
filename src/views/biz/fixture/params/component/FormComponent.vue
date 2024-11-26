<template>
  <el-form :model="queryParams" class="form-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-form-item label="治具编号">
          <el-input v-model="queryParams.fixtureNo" placeholder="请输入治具编号" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="治具类型">
          <el-select v-model="queryParams.fixtureType" placeholder="请选择治具类型">
            <el-option label="类型A" value="A" />
            <el-option label="类型B" value="B" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
export default {
  props: {
    queryParams: { type: Object, required: true },
  },
  methods: {
    search() {
      this.$emit("onSearch", this.queryParams);
    },
    reset() {
      this.$emit("onSearch", { fixtureNo: "", fixtureType: "" });
    },
  },
};
</script>
