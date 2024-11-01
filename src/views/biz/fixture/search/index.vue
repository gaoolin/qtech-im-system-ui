<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" :rules="rules" label-width="68px">
      <el-form-item label="料号" prop="materialNmb">
        <el-input
          v-model="queryParams.materialNmb"
          placeholder="请输入料号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机种" prop="prodType">
        <el-input
          v-model="queryParams.prodType"
          placeholder="请输入机种"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="治具类型" prop="fixtureCategory">
        <el-select
          v-model="queryParams.fixtureCategory"
          style="width: 280px"
          placeholder="请输入治具类型"
          clearable
          @keyup.enter.native="handleQuery"
          @change="changeOneSelection($event, categoryOptions, queryParams.fixtureCategory)">
          <el-option
            v-for="item in categoryOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label=" " prop="deptId">
        <el-radio-group
          style="width: 100px"
          v-model="queryParams.deptId"
          v-for="item in dictProjectObject"
          :key="item.dictValue"
          clearable
          @keyup.enter.native="handleQuery"
          @change="changeOneSelection($event, dictProjectObject, queryParams.deptId)">
          <el-radio :label="item.dictValue">{{ item.dictLabel }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-alert
      title="注意：为确保信息的准确,查到共用信息后须与治具设计核对后方可使用！"
      type="warning"
      show-icon
      style="font-weight: bolder"
    >
    </el-alert>

    <el-table
      v-loading="loading"
      :data="dataList"
      :header-cell-style="headerCellStyle()"
      :cell-style="bodyCellStyle()"
      :style="tableStyle()"
    >
      <el-table-column label="料号" align="center" width="150" prop="materialNmb" fixed/>
      <el-table-column label="品名" align="center" width="120" prop="fixtureName" fixed show-overflow-tooltip />
      <el-table-column label="规格" align="center" width="120" prop="fixtureSpec" fixed show-overflow-tooltip />
      <el-table-column label="机种" align="center" width="130" prop="prodType" fixed show-overflow-tooltip />
      <el-table-column label="治具类型" align="center" width="150" prop="fixtureCategory" fixed show-overflow-tooltip >
        <template slot-scope="scope">{{scope.row.fixtureCategory}}</template>
      </el-table-column>
      <el-table-column label="治具版本" align="center" width="90" prop="fixtureVersion" fixed />
      <el-table-column label="连接器朝向" align="center" width="90" prop="buckle" fixed>
        <template slot-scope="scope">
          <dict-tag v-if="queryParams.deptId === '209'" :options="dict.type.fixture_buckle_status" :value="scope.row.buckle" />
          <dict-tag v-else-if="queryParams.deptId === '210'" :options="dict.type.fixture_aa_buckle_status" :value="scope.row.buckle" />
          <dict-tag v-else-if="queryParams.deptId === '211'" :options="dict.type.fixture_lock_buckle_status" :value="scope.row.buckle" />
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" width="90" prop="createBy" />
      <el-table-column label="创建时间" align="center" width="180" prop="createTime" >
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新人" align="center" width="90" prop="updateBy" />
      <el-table-column label="更新时间" align="center" width="180" prop="updateTime" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" width="180" prop="remark" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="120" style="font-size: 8px" v-if="checkRole(['fixture:a', 'fixture:b'])">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleEdit(scope.row)">修改</el-button>
          <el-popover
            style="margin-left: 5px"
            placement="top"
            width="160"
            content="请选择要删除的内容">
            <p>请选择要删除的内容！</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="handleDelete(scope.row, 1)">料号</el-button>
              <el-button type="primary" size="mini" @click="handleDelete(scope.row, 2)">机型</el-button>
            </div>
            <el-button slot="reference" size="mini" type="text">删除</el-button>
          </el-popover>
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

    <el-dialog :title="title" :visible.sync="dialogVisible" :width="'400px'">
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="料号" prop="materialNmb">
          <el-input v-model="form.materialNmb" autocomplete="off" :disabled="true" placeholder="请输入料号" />
        </el-form-item>
        <el-form-item label="品名" prop="fixtureName">
          <el-input v-model="form.fixtureName" :disabled="true" placeholder="请输入品名" />
        </el-form-item>
        <el-form-item label="规格" prop="fixtureSpec">
          <el-input v-model="form.fixtureSpec" :disabled="true" placeholder="请输入品名" />
        </el-form-item>
        <el-form-item label="机型" prop="prodType">
          <el-input v-model="form.prodType" placeholder="请输入机型" />
        </el-form-item>
        <el-form-item label="治具类型" prop="fixtureCategory" >
          <el-input v-model="form.fixtureCategory" placeholder="请输入治具类型" :disabled="true" />
        </el-form-item>
        <el-form-item label="治具版本" prop="fixtureVersion">
          <el-input v-model="form.fixtureVersion" placeholder="请输入治具版本" :disabled="true" />
        </el-form-item>
        <el-form-item label="连接器朝向" prop="buckle" v-if="queryParams.deptId!=='211'">
          <el-radio-group v-model="form.buckle" placeholder="请输入连接器朝向" :disabled="true" v-if="queryParams.deptId==='209'">
            <el-radio
              v-for="dict in dict.type.fixture_buckle_status"
              :key="dict.value"
              :label="dict.value"
            >{{ dict.label }}
            </el-radio>
          </el-radio-group>
          <el-radio-group v-model="form.buckle" placeholder="请输入连接器朝向" :disabled="true" v-else-if="queryParams.deptId==='210'">
            <el-radio
              v-for="dict in dict.type.fixture_aa_buckle_status"
              :key="dict.value"
              :label="dict.value"
            >{{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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
import {
  delFixtureSharedInfo,
  listFixture,
  updateFixtureSharedInfo,
  getFixtureSharedInfo,
  getDeptIds,
  getFixturematerialNmbs,
  fixtureCategoryAll
} from '@/api/biz/fixture/fixture'
import { bodyCellStyle, headerCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles'
import { checkPermi, checkRole } from "@/utils/permission"; // 权限判断函数

export default {
  name: 'fixture',
  dicts: ['biz_fixture_category', 'fixture_buckle_status', 'fixture_aa_buckle_status', 'fixture_lock_buckle_status', 'biz_fixture_project'],

  data() {
    return {
      deleteDialogVisible: true,
      // 遮罩层
      loading: true,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      dialogVisible: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        materialNmb: null,
        prodType: null,
        fixtureCategory: null,
        deptId: null
      },
      deptIds: [],
      dictProjectObject: [],
      // 表单参数
      form: {
        materialNmb: "",
      },
      // 表单校验
      rules: {},
      // 治具类型选择器
      categoryOptions: [],
      // 治具表格数据
      dataList: [],
      // 修改时，治具类型是否可修改
      materialNmbDisabled: false,
      prodTypeDisabled: false,
      othersDisabled: false,
      fixtureCategoryList: [],
      activeName: "first",
      arr1: [],
      arr2: [],
      arr3: [],
      arr4: [],
      arr5: [],
      arr6: [],
      position1: 0,
      position2: 0,
      position3: 0,
      position4: 0,
      position5: 0,
      position6: 0,
      // 需要合并项的列
      needMergeArr: [
        {
          colName: "materialNmb",
          mergeCheckNames: ["materialNmb"],
        },
        {
          colName: "fixtureName",
          mergeCheckNames: ["materialNmb", "fixtureName"],
        },
        {
          colName: "fixtureSpec",
          mergeCheckNames: ["materialNmb", "fixtureName", "fixtureSpec"],
        },
        {
          colName: "fixtureCategory",
          mergeCheckNames: ["materialNmb", "fixtureName", "fixtureSpec", "fixtureCategory"],
        },
        {
          colName: "fixtureVersion",
          mergeCheckNames: ["materialNmb", "fixtureName", "fixtureSpec", "fixtureCategory", "fixtureVersion"],
        },
        {
          colName: "prodType",
          mergeCheckNames: ["materialNmb", "fixtureName", "fixtureSpec", "prodType", "fixtureCategory", "prodType"],
        },
      ],
      rowMergeArrs: {}, // 包含需要一个或多个合并项信息的对象
    };
  },

  methods: {
    bodyCellStyle,
    headerCellStyle,
    tableStyle,
    checkPermi,
    checkRole,
    /** 查询治具列表 */
    getList() {
      this.loading = true;
      listFixture(this.queryParams).then(response => {
        response.rows.forEach(row => {
          if (row['buckle'] != null && row['buckle'] !== '') {
            row['buckle'] = row['buckle'].toString();
          }
          row['deptId'] = row['deptId'].toString();
        })
        this.dataList = response.rows;
        this.total = response.total;

        this.rowMergeArrs = this.rowMergeHandle(this.needMergeArr, response.rows);

        this.loading = false;
        this.getFixtureCategoryOptions(); // 首页治具类型下拉框数据
      });
    },

    getAllowedData() {
      getDeptIds().then(response => {
        this.deptIds = response.data
        this.getDataScope();
      })
    },

    getDataScope() {
      this.dictProjectObject = [];
      this.getDicts("biz_fixture_project").then(response => {
        response.data.forEach(item => {
          if (this.deptIds.indexOf(item["dictValue"]) !== -1) {
            const o = {}
            o.dictValue = item["dictValue"];
            o.dictLabel = item["dictLabel"];
            this.dictProjectObject.push(o);
          }
        })
        if (this.queryParams.deptId !== null) {
          this.getList();
        } else if (this.dictProjectObject[0] !== undefined) {
          this.queryParams.deptId = this.dictProjectObject[0].dictValue
          this.getList();
        }
      })
    },
    /** 判断数据是否隔离 */
    isDeptIdAll() {
      if (this.queryParams.deptId === '207' || this.queryParams.deptId === '208' || this.queryParams.deptId === null) {
        this.$modal.msgWarning("查询或变更治具信息时，须指定具体类别！")
        return false;
      } else {
        this.form.deptId = this.queryParams.deptId;
        return true;
      }
    },

    // 取消按钮
    cancel() {
      this.dialogVisible = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        mId: null,
        cId: null,
        pId: null,
        prodType: null,
        fixtureCategory: null,
        buckle: null,
        fixtureName: null,
        fixtureVersion: null,
        materialNmb: null,
        fixtureSpec: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        deptId: null,
        remark: null,
        submitFlag: null,
      };
      this.resetForm("form");
    },

    /** 重置合并单元格信息 */
    resetSpan() {
      this.arr1 = [];
      this.arr2 = [];
      this.arr3 = [];
      this.arr4 = [];
      this.arr5 = [];
      this.arr6 = [];
      this.position1 = 0;
      this.position2 = 0;
      this.position3 = 0;
      this.position4 = 0;
      this.position5 = 0;
      this.position6 = 0;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      if (this.isDeptIdAll()) {
        this.queryParams.pageNum = 1;
        this.getList();
      }
    },
    /** 重置按钮操作 */
    resetQuery() {
        this.resetForm("queryForm");
        this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.single = selection.length!==1
      this.multiple = !selection.length
    },

    /** 提交按钮 */
    submitForm() {
      // this.reset(); // 会丢失编辑信息
      if (this.isDeptIdAll()) {
          this.$refs["form"].validate(valid => {
            if (valid) {
              updateFixtureSharedInfo(this.form).then(response => {
                this.$modal.msgSuccess("治具信息修改成功！")
                this.dialogVisible = false
                this.getList()
              })
            }}
          )
        }
      },
    /** 删除按钮操作 */
/*    handleDelete(row) {
      if (this.isDeptIdAll()) {
          this.$modal.confirm("是否删除治具料号为 " + row.materialNmb + '“的数据项？').then(() => {
            return delFixtureSharedInfo({
              materialNmb: row.materialNmb,
              prodType: row.prodType,
              fixtureCategory: row.fixtureCategory,
              deptId: this.queryParams.deptId
            }).then(() => {
              this.$modal.msgSuccess("删除成功");
              this.getList();
              this.reset();
            }).catch(() => {});
          })
      }
    },*/
    handleDelete(row, flag) {
      if (flag === 1) {
        this.$modal.confirm("是否删除料号为:" + row.materialNmb + '的数据项？').then(response => {

          return delFixtureSharedInfo({
            id: row.id,
            materialNmb: row.materialNmb,
            fixtureCategory: row.fixtureCategory,
            deptId: this.queryParams.deptId
          }).then(() => {
            this.$modal.msgSuccess("删除成功");
            this.getList();
            this.reset();
          }).catch(() => {});
        })
      } else if (flag === 2) {
        this.$modal.confirm('是否确认删除料号为:' + row.materialNmb + ', 型号为:' + row.prodType + '的数据项？').then(response => {

          return delFixtureSharedInfo({
            id: row.id,
            materialNmb: row.materialNmb,
            fixtureCategory: row.fixtureCategory,
            prodType: row.prodType,
            deptId: this.queryParams.deptId
          }).then(() => {
            this.$modal.msgSuccess("删除成功");
            this.getList();
            this.reset();
          }).catch(() => {});
        })
      }
    },
    handleEdit(row) {
      if (this.isDeptIdAll()) {
        getFixtureSharedInfo(row.id).then(response => {
          if (row['buckle'] != null && row['buckle'] !== '') {
            response.data['buckle'] = response.data['buckle'].toString()
          }
          this.form = response.data
          this.dialogVisible = true
          this.title = '修改治具信息'
        })
        }
    },
    /** 导出按钮操作 */
    handleExport() {
      if (this.isDeptIdAll()) {
        this.download('/fixture/search/export', {
          ...this.queryParams
        }, `共治具信息_${new Date().getTime()}.xlsx`)
      }
      this.reset();
    },

    /** 表格合并行 */
    arraySpanMethod({row, column, rowIndex, columnIndex}) {
      let needMerge = this.needMergeArr.some((item) => {
        return item.colName === column.property;
      });
      if (needMerge === true) {
        return this.mergeAction(column.property, rowIndex, column);
      }
    },

    mergeAction(val, rowIndex, colData) {
      let _row = this.rowMergeArrs[val].rowArr[rowIndex];
      let _col = _row > 0 ? 1 : 0;
      return [_row, _col];
    },

    rowMergeHandle(arr, data) {
      if (!Array.isArray(arr) && !arr.length) return false;
      if (!Array.isArray(data) && !data.length) return false;
      let needMerge = {};

      arr.forEach((mergeItem) => {
        // 创建合并管理对象
        needMerge[mergeItem.colName] = {
          rowArr: [],
          rowMergeNum: 0,
        };
        let currentMergeItemData = needMerge[mergeItem.colName];

        // 进行合并管理对象数据的遍历整理
        data.forEach((item, index) => {
          if (index === 0) {
            currentMergeItemData.rowArr.push(1);
            currentMergeItemData.rowMergeNum = 0;
          } else {
            let currentRowData = data[index];
            let preRowData = data[index - 1];

            if (this.colMergeCheck(currentRowData, preRowData, mergeItem.mergeCheckNames)) {
              currentMergeItemData.rowArr[currentMergeItemData.rowMergeNum] += 1;
              currentMergeItemData.rowArr.push(0);
            } else {
              currentMergeItemData.rowArr.push(1);
              currentMergeItemData.rowMergeNum = index;
            }
          }
        });
      });
      return needMerge;
    },

    colMergeCheck(currentRowData, preRowData, mergeCheckNames) {
      if (!Array.isArray(mergeCheckNames) && !mergeCheckNames.length) return false;
      let result = true;
      for (let index = 0; index < mergeCheckNames.length; index++) {
        const mergeCheckName = mergeCheckNames[index];
        if (currentRowData[mergeCheckName] !== preRowData[mergeCheckName]) {
          result = false;
          break;
        }
      }
      return result;
    },

    /** 获取字典信息 */
    getProjectFormat(key) {
      return this.selectDictLabel(this.dict.type.biz_fixture_project, key);
    },

    /** 给输入框设置值 */
    changeOneSelection(val, fromObj, targetStr) {
      fromObj.find(item => {
        if (item.value === val) {
          targetStr = item
        }
      });
      this.getList();
    },

    /** 治具类型管理 治具类型下拉框赋值*/
    getFixtureCategoryOptions() {
      this.categoryOptions = [];
      fixtureCategoryAll(this.form).then(response => {
        for (const i in response.data) {
          this.categoryOptions.push(response.data[i]['fixtureCategory'])}})
    },

    /** 新增料号对话框 */
    getFixturematerialNmbs() {
      if (this.isDeptIdAll()) {
        getFixturematerialNmbs(this.form.deptId).then(response => {
          this.restaurants = response.rows;
        });
      }
    },

    /** 样式控制方法 */
    changeCellStyle(row, column, rowIndex, columnIndex) {
      if(row.column.label === "料号"){
        return 'color: blue; font-weight: bolder'  // 修改的样式
      } else if (row.column.label === "机种") {
        return 'font-weight: bolder'
      } else {
        return ''
      }
    },
  },
  mounted() {
    this.getAllowedData();
  },
  created() {
    if (this.$route.query.materialNmb === undefined || this.$route.query.materialNmb === null || this.$route.query.materialNmb === '') {
      this.queryParams.materialNmb = null
      this.queryParams.deptId = null
    } else {
      this.queryParams.materialNmb = this.$route.query.materialNmb
      this.queryParams.deptId = this.$route.query.deptId
    }
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

//修改行高
//::v-deep .el-table td{
//  padding:0px 0px;  //默认上下是padding12px
//}
.box-ops {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

