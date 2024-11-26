<!--  dialog组件-->
<template>
  <el-dialog :title="title" :close-on-click-modal="isCloseOnClick" :visible.sync="dialogVisible" :width="width" :name="name" :append-to-body="appendToBody" @close="closeDialog(1, name)">
    <slot></slot>
    <div slot="footer" class="dialog-footer">
      <!--   native对应的是本页面方法，否则会被认为父组件的方法而报错   -->
      <el-button type="warning" @click.native="closeDialog(3, name)" v-if="resetBtn">{{ '重 置'}}</el-button>
      <el-button @click.native="closeDialog(0, name)">{{ cancelName }}</el-button>
      <el-button type="primary" @click.native="closeDialog(2, name)">{{ confirmName }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ModalUdf',

  props: {
    dialogShow: { // 弹窗是否展示
      type: Boolean,
      default: false
    },
    title: { // 标题
      type: String,
      default: '提示'
    },
    width: { //弹窗宽度
      type: String,
      default: '400px'
    },
    name: {
      type: String,
      default: 'default'
    },
    isCloseOnClick: {
      type: Boolean,
      default: false
    },
    cancelName: { //取消按钮名称
      type: String,
      default: '取 消'
    },
    confirmName: { //确定按钮名称
      type: String,
      default: '确 定'
    },
    resetBtn: {
      type: Boolean,
      default: false
    },
    isShowFooter: { //是否自定底部
      type: Boolean,
      default: true
    },
    appendToBody: { // 是否将自身插入至 body 元素，有嵌套的弹窗时一定要设置
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      dialogVisible: this.dialogShow
    }
  },
  computed: {},
  watch: {
    dialogShow(val) {
      this.dialogVisible = val
    },
  },
  methods: {
    /**
     * 关闭弹出框事件，触发父级组件中的子组件@closeChildDialog所对应的方法
     */
    closeDialog(flag, name) {
      console.log(flag, name)
      this.$emit('closeChildDialog', flag, name)
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {

  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {

  },
  beforeCreate() {
  },
  beforeMount() {
  },
  beforeUpdate() {
  },
  updated() {
  },
  beforeDestroy() {
  },
  destroyed() {
  },
  //如果页面有keep-alive缓存功能，这个函数会触发
  activated() {
  }
}
</script>

<style scoped lang="scss">
.dialog {
}
::v-deep .el-dialog {
  .el-dialog__header {
    box-shadow: 0px 0px 5px 0px rgba(136, 152, 157, 0.3);
    border-radius: 6px 6px 0px 0px;
    padding: 20px 20px 18px 25px;
    .el-dialog__title {
      color: #212121;
      font-weight: bolder;
    }
  }
  .el-dialog__body {
    padding-left: 25px;
  }
}
</style>
