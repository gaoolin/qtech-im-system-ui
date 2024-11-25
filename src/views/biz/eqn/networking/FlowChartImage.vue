<template>
  <el-dialog
    :visible.sync="visible"
    width="80%"
    :close-on-click-modal="false"
    :append-to-body="true"
    custom-class="flow-chart-dialog"
    title="设备如何反控流程图"
  >
    <!-- 流程图主体 -->
    <div class="flow-chart-container">
      <img :src="flowChartSrc" alt="流程图" class="flow-chart-image" />
    </div>

    <!-- 弹窗底部按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="closeDialog">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    flowChartSrc: {
      type: String,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:visible", false); // Vue 2 中使用 v-model.sync 的事件格式
    },
  },
};
</script>

<style scoped>
/* 弹窗自定义样式 */
.flow-chart-dialog {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  background-color: #f9fafc; /* 温和浅色背景 */
  padding: 20px;
}

/* 弹窗标题样式 */
.el-dialog__header {
  font-size: 18px;
  font-weight: 600;
  color: #333; /* 深灰色标题 */
  text-align: center;
  border-bottom: 1px solid #e5e5e5;
}

/* 流程图容器样式 */
.flow-chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  padding: 10px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 流程图图片样式 */
.flow-chart-image {
  max-width: 100%; /* 保持图片宽度自适应 */
  height: auto; /* 保证比例 */
  border-radius: 4px;
  border: 1px solid #e5e5e5;
}

/* 弹窗底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #e5e5e5;
}

.dialog-footer .el-button {
  min-width: 80px;
  height: 36px;
  font-size: 14px;
}
</style>
