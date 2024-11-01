<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="机型" prop="mcId">
        <el-input
          v-model="queryParams.mcId"
          placeholder="请输入机型"
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
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wbOlp:detail:edit']"
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
          v-hasPermi="['wbOlp:detail:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['wbOlp:detail:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="detailList"
      @selection-change="handleSelectionChange"
      :cell-style="bodyCellStyle()"
      :header-cell-style="headerCellStyle()"
      :style="tableStyle()"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="来源" align="center" prop="source" />
      <el-table-column label="机型" align="center" prop="mcId" />
      <el-table-column label="线号" align="center" prop="lineNo" />
      <el-table-column label="leadX" align="center" prop="leadX">
        <template slot-scope="scope">
          <span>{{ getBit(scope.row.leadX, 2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="leadY" align="center" prop="leadY">
        <template slot-scope="scope">
          <span>{{ getBit(scope.row.leadY, 2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="padX" align="center" prop="padX">
        <template slot-scope="scope">
          <span>{{ getBit(scope.row.padX, 2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="padY" align="center" prop="padY">
        <template slot-scope="scope">
          <span>{{ getBit(scope.row.padY, 2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="lead间距" align="center" prop="leadDiff">
        <template slot-scope="scope">
          <span>{{ getBit(scope.row.leadDiff, 2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="pad间距" align="center" prop="padDiff">
        <template slot-scope="scope">
          <span>{{ getBit(scope.row.padDiff, 2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="lead卡控" align="center" prop="leadThreshold" />
      <el-table-column label="pad卡控" align="center" prop="padThreshold" />
      <el-table-column label="金线长" align="center" prop="wireLen" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-if="checkRole(['wbOlp:admin'])">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['wbOlp:detail:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['wbOlp:detail:remove']"
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

    <!-- 添加或修改标准模版明细对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="来源" prop="source">
          <el-input v-model="form.source" placeholder="请输入来源" />
        </el-form-item>
        <el-form-item label="机型" prop="mcId">
          <el-input v-model="form.mcId" placeholder="请输入机型" :disabled="true" />
        </el-form-item>
        <el-form-item label="线号" prop="lineNo">
          <el-input v-model="form.lineNo" placeholder="请输入线号" />
        </el-form-item>
        <el-form-item label="leadX" prop="leadX">
          <el-input v-model="form.leadX" placeholder="请输入leadX" />
        </el-form-item>
        <el-form-item label="leadY" prop="leadY">
          <el-input v-model="form.leadY" placeholder="请输入leadY" />
        </el-form-item>
        <el-form-item label="padX" prop="padX">
          <el-input v-model="form.padX" placeholder="请输入padX" />
        </el-form-item>
        <el-form-item label="padY" prop="padY">
          <el-input v-model="form.padY" placeholder="请输入padY" />
        </el-form-item>
        <el-form-item label="lead间距" prop="leadDiff">
          <el-input v-model="form.leadDiff" placeholder="请输入lead间距" />
        </el-form-item>
        <el-form-item label="pad间距" prop="padDiff">
          <el-input v-model="form.padDiff" placeholder="请输入pad间距" />
        </el-form-item>
        <el-form-item label="lead点卡控" prop="leadThreshold">
          <el-input v-model="form.leadThreshold" placeholder="请输入lead点卡控" />
        </el-form-item>
        <el-form-item label="pad点卡控" prop="padThreshold">
          <el-input v-model="form.padThreshold" placeholder="请输入pad点卡控" />
        </el-form-item>
        <el-form-item label="lead到pad的线长" prop="wireLen">
          <el-input v-model="form.wireLen" placeholder="请输入lead到pad的线长" />
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
import { listDetail, getDetail, delDetail, addDetail, updateDetail } from "@/api/biz/wb/detail";
import { getBit } from '@/views/biz/common/js/utils'
import { checkPermi, checkRole } from "@/utils/permission"; // 权限判断函数

export default {
  name: "Detail",
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
      // 标准模版明细表格数据
      detailList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        mcId: null,
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
    getBit,

    /** 查询标准模版明细列表 */
    getList() {
      this.loading = true;
      listDetail(this.queryParams).then(response => {
        this.detailList = response.rows;
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
        id: null,
        source: null,
        mcId: null,
        lineNo: null,
        leadX: null,
        leadY: null,
        padX: null,
        padY: null,
        leadDiff: null,
        padDiff: null,
        leadThreshold: null,
        padThreshold: null,
        wireLen: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
        fid: null
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getDetail(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改打线图模版明细";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateDetail(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDetail(this.form).then(response => {
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
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除标准模版明细编号为"' + ids + '"的数据项？').then(function() {
        return delDetail(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('wb/olp/detail/export', {
        ...this.queryParams
      }, `detail_${new Date().getTime()}.xlsx`)
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
