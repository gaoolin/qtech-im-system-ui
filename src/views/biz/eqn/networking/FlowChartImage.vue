<template>
  <el-dialog
    :visible.sync="localVisible"
    width="70%"
    :close-on-click-modal="false"
    :append-to-body="true"
    custom-class="flow-chart-dialog"
    title="设备如何反控流程图"
    @close="closeDialog"
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
  data() {
    return {
      localVisible: this.visible, // 使用本地变量同步 prop
    };
  },
  watch: {
    // 监听父组件传入的 visible 变化
    visible(newVal) {
      this.localVisible = newVal;
    },
    // 将本地状态的变化同步到父组件
    localVisible(newVal) {
      this.$emit("update:visible", newVal); // 通过 sync 机制通知父组件
    },
  },
  methods: {
    closeDialog() {
      this.localVisible = false; // 关闭弹窗并触发 sync
    },
  },
};
</script>

<style scoped>
/* 样式保持不变 */
.flow-chart-dialog {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  background-color: #f9fafc;
  padding: 20px;
}
.el-dialog__header {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
  border-bottom: 1px solid #e5e5e5;
}
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
.flow-chart-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
}
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
