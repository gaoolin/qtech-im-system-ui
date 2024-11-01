<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
             label-width="68px">
      <el-form-item label="机型" prop="mcId">
        <el-input
          v-model="queryParams.mcId"
          placeholder="请输入机型"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择模版状态" clearable style="width: 240px">
          <el-option
            v-for="dict in dict.type.comparison_mod_status"
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
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wbOlp:info:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wbOlp:info:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['wbOlp:info:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="comparisonList"
      @selection-change="handleSelectionChange"
      :cell-style="bodyCellStyle"
      :header-cell-style="headerCellStyle"
      :style="tableStyle()"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="55" align="center" fixed />
      <el-table-column label="机型" align="center" prop="mcId" />
      <el-table-column label="线数" align="center" prop="lineCount" />
      <el-table-column prop="status" label="模版状态" width="80" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="changeSwitch(scope.row.sid, scope.row.status)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="模板数据提供人" align="center" prop="provider" />
      <el-table-column label="模板所属厂区" align="center" prop="factory" />
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" min-width="150" align="center" prop="createTime" />
      <el-table-column label="最后更新人" align="center" prop="updateBy" />
      <el-table-column label="最后更新时间" min-width="150" align="center" prop="updateTime" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-if="checkRole(['wbOlp:admin'])">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['wbOlp:info:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['wbOlp:info:remove']"
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

    <!-- 添加或修改智慧打线图对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="机型" prop="mcId">
          <el-input v-model="form.mcId" placeholder="请输入机型" :disabled="true" />
        </el-form-item>
        <el-form-item label="线数" prop="lineCount">
          <el-input v-model="form.lineCount" placeholder="请输入线数" :disabled="true" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.comparison_mod_status"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模板数据提供人" prop="provider">
          <el-input v-model="form.provider" placeholder="请输入模板数据提供人" />
        </el-form-item>
        <el-form-item label="模板所属厂区" prop="factory">
          <el-input v-model="form.factory" placeholder="请输入模板所属厂区" />
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
import { bodyCellStyle, headerCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles'
import { listComparison, getComparison, delComparison, addComparison, updateComparison } from "@/api/biz/wb/info";
import { checkPermi, checkRole } from "@/utils/permission"; // 权限判断函数

export default {
  name: "Comparison",
  dicts: ['comparison_mod_status'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 选中机型
      mcIds: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 智慧打线图表格数据
      comparisonList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        sid: null,
        mcId: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    checkPermi,
    checkRole,
    headerCellStyle,
    bodyCellStyle,
    tableStyle,
    /** 查询智慧打线图列表 */
    getList() {
      this.loading = true;
      listComparison(this.queryParams).then(response => {
        this.comparisonList = response.rows;
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
        sid: null,
        mcId: null,
        lineCount: null,
        status: null,
        createTime: null,
        provider: null,
        factory: null,
        remark: null
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
      this.ids = selection.map(item => item.sid)
      this.mcIds = selection.map(item => item.mcId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加打线图模版信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const sid = row.sid || this.ids;
      getComparison(sid).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改打线图模版信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.sid != null) {
            updateComparison(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addComparison(this.form).then(response => {
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
      const sids = row.sid || this.ids;
      const mcIds = row.mcId || this.mcIds;
      this.$modal.confirm('是否确认删除打线图机型为"' + mcIds + '"的数据项？').then(function() {
        return delComparison(sids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 修改模版状态 */
    changeSwitch(sid, status) {
      this.queryParams.sid = sid;
      this.queryParams.status = status;
      updateComparison(this.queryParams).then(response => {
        if (response.code === 200) {
          this.getList();
          this.$modal.msgSuccess("修改成功！")
        } else {
          this.$modal.msgError("返回状态码异常，请检查！")
        }
      }).catch(() => {})

      this.queryParams.sid = null;
      this.queryParams.status = null;
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('wb/olp/info/export', {
        ...this.queryParams
      }, `comparison_${new Date().getTime()}.xlsx`)
    }
  },
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
