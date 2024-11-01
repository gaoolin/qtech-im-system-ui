<template>
  <el-form
    ref="form"
    :model="form"
    :rules="(materialIdDisabled === false && othersDisabled === false) ? rules : ((materialIdDisabled === true && othersDisabled === true) ? rulesAddShared : rulesUpdate)"
    label-width="85px" >
    <el-form-item label="料号" prop="materialId" >
      <el-input
        v-model="form.materialId"
        type="text"
        autocomplete="off"
        :disabled="materialIdDisabled"
        placeholder="请输入料号">
      </el-input>
    </el-form-item>
    <el-form-item label="品名" prop="fixtureName">
      <el-input v-model="form.fixtureName" placeholder="请输入品名" :disabled="othersDisabled "/>
    </el-form-item>
    <el-form-item label="规格" prop="fixtureSpec">
      <el-input v-model="form.fixtureSpec" placeholder="请输入规格"  type="textarea" :disabled="othersDisabled" />
    </el-form-item>
    <el-form-item label="治具版本" prop="fixtureVersion" >
      <el-input v-model="form.fixtureVersion" placeholder="请输入治具版本" :disabled="othersDisabled"/>
    </el-form-item>
    <el-form-item label="连接器朝向" prop="buckle">
      <el-radio-group v-model="form.buckle" :disabled="othersDisabled">
        <el-radio
          v-for="dict in dict.type.fixture_buckle_status"
          :key="dict.value"
          :label="dict.value"
        >{{dict.label}}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="治具类型" prop="fixtureCategory">
      <!-- 请求返回的form.fixtureCategory是 int 类型，字典的key是string类型，需要把int转成string，否则输入框不能自动转换成value/label -->
      <el-select v-model="form.fixtureCategory" placeholder="请选择治具类型" clearable style="width: 240px" :disabled="othersDisabled">
        <el-option
          v-for="item in categoryOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="连接器型号" prop="connectorModel">
      <el-input v-model="queryParams.connectorModel" placeholder="连接器型号" clearable @keyup.enter.native="handleQuery"/>
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input v-model="form.remark" placeholder="请输入备注" type="textarea"/>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'PogopinDialogForm',
  props: {
    form: {
      type: Object,
      default: {}
    }
  }
}
</script>

<style scoped>

</style>
