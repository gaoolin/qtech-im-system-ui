<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="机型" prop="prodType">
        <el-input
          v-model="queryParams.prodType"
          placeholder="请输入机型"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="线径" prop="wireWidth">
        <el-input
          v-model="queryParams.wireWidth"
          placeholder="请输入线径"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['biz/wire/standard:query:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['biz/wire/standard:query:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="queryList"
      @selection-change="handleSelectionChange"
      :cell-style="bodyCellStyle()"
      :header-cell-style="headerCellStyle()"
      :style="tableStyle()"
    >
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="机型" align="center" prop="prodType" />
      <el-table-column label="线径" align="center" prop="wireWidth" />
      <el-table-column label="标准用量" align="center" prop="standardWireUsage" >
        <template slot-scope="scope">{{ getBit(scope.row.standardWireUsage, 4) }}</template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="更新人" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['biz/wire/standard:query:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['biz/wire/standard:query:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改金线标准用量信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="机型" prop="prodType">
          <el-input v-model="form.prodType" placeholder="请输入机型" :disabled="isProdTypeDisabled" />
        </el-form-item>
        <el-form-item label="线径" prop="wireWidth">
          <el-input v-model="form.wireWidth" placeholder="请输入线径" />
        </el-form-item>
        <el-form-item label="标准用量" prop="standardWireUsage">
          <el-input v-model="form.standardWireUsage" placeholder="请输入标准用量" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { headerCellStyle, bodyCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles';
import { listQuery, getQuery, delQuery, addQuery, updateQuery } from "@/api/biz/wire/standard";

export default {
  name: "Query",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 金线标准用量信息表格数据
      queryList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        prodType: null,
        wireWidth: null,
      },
      // 表单参数
      form: {},
      // 控制输入框禁用
      isProdTypeDisabled: true,
      // 选中的机型
      prodTypes: []
    };
  },

  created() {
    this.getList();
  },

  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,
    /** 查询金线标准用量信息列表 */
    getList() {
      this.loading = true;
      listQuery(this.queryParams).then(response => {
        this.queryList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        prodType: null,
        wireWidth: null,
        standardWireUsage: null,
        flag: null,
        remark: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.prodTypes = selection.map(item => item.prodType)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加金线标准用量信息";
      this.isProdTypeDisabled = false;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const prodType = row.prodType || this.prodTypes
      getQuery(prodType).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改金线标准用量信息";
        this.isProdTypeDisabled = true;
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.isProdTypeDisabled === true) {
            updateQuery(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addQuery(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const prodType = row.prodType || this.prodTypes
      this.$modal.confirm('是否确认删除金线标准用量信息编号为"' + prodType + '"的数据项？').then(function() {
        return delQuery(prodType);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('biz/wire/standard/export', {
        ...this.queryParams
      }, `金线标准用量_${new Date().getTime()}.xlsx`)
    },
    /** 四舍五入 保留N位小数 */
    getBit(value, bit = 2) {
      if (value !== null && value !== '') {
        let str = Number(value)
        str = str.toFixed(bit)
        return str
      } else {
        return null
      }
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
