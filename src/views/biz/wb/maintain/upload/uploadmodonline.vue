<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px"
             :rules="rules"
    >
      <el-form-item label="机型" prop="mcId">
        <el-input
          v-model="queryParams.mcId"
          placeholder="机型"
          @change="submitBtn()"
          clearable
          style="width: 130px"
        />
      </el-form-item>

      <el-form-item label="盒子号" prop="simId">
        <el-input
          v-model="queryParams.simId"
          placeholder="盒子号"
          @change="submitBtn()"
          clearable
          style="width: 160px"
        />
      </el-form-item>

      <el-form-item label="产品序号" prop="pId">
        <el-input
          v-model="queryParams.pId"
          placeholder="产品序号"
          clearable
          style="width: 100px"
        />
      </el-form-item>
      <el-form-item label="时段" prop="dtRange" required>
        <el-date-picker
          v-model="queryParams.dtRange"
          style="width: 340px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
          @change="handleQuery"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="Lead卡控值" prop="leadThreshold" label-width="120px" required fixed>
        <el-input
          v-model="queryParams.leadThreshold"
          placeholder="卡控值"
          clearable
          style="width: 90px"
        ></el-input>
      </el-form-item>

      <el-form-item label="Pad卡控值" prop="padThreshold" label-width="120px" required fixed>
        <el-input
          v-model="queryParams.padThreshold"
          placeholder="卡控值"
          clearable
          style="width: 90px"
        />
      </el-form-item>

    </el-form>

    <el-row class="mb8">
      <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
      <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>

      <el-button type="danger" size="mini" class="bigBtn" :disabled="hadSubmit" @click="onlineSubmit" @confirm>
        {{ submitText }}
      </el-button>

      <right-tool-bar-download :showSearch.sync="showSearch" @queryTable="getList" @handleExport="handleExport"></right-tool-bar-download>
    </el-row>

    <!-- ref="multipleTable"必须写，用于 toggleSelection方法通过vue调用dom的方法      -->
    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="dataList" border stripe
      highlight-current-row
      @selection-change="handleSelectionChange"
      :header-cell-style="headerCellStyle()"
      :style="tableStyle()"
    >
      <el-table-column prop="tableRowId" label="#" type="selection" align="center">
      </el-table-column>
      <el-table-column prop="simId" label="盒子号" min-width="90px" align="center">
      </el-table-column>
      <el-table-column prop="dt" label="时间" min-width="100px" align="center">
      </el-table-column>
      <el-table-column prop="mcId" label="机型" align="center" min-width="90px">
      </el-table-column>
      <el-table-column label="线号" align="center" min-width="40px">
        <template slot-scope="scope">{{ scope.row.lineNo }}</template>
      </el-table-column>
      <el-table-column prop="leadX" label="LeadX" align="center" min-width="70px">
      </el-table-column>
      <el-table-column prop="leadY" label="LeadY" align="center" min-width="70px">
      </el-table-column>
      <el-table-column prop="padX" label="PadX" align="center" min-width="70px">
      </el-table-column>
      <el-table-column prop="padY" label="PadY" align="center" min-width="70px">
      </el-table-column>
      <el-table-column prop="leadDiff" label="lead间距" align="center" min-width="50px">
      </el-table-column>
      <el-table-column prop="padDiff" label="pad间距" align="center" min-width="50px">
      </el-table-column>
      <el-table-column prop="leadThreshold" label="lead卡控" :key="queryParams.leadThreshold" align="center"
                       min-width="50px"
      >
        {{ queryParams.leadThreshold }}
      </el-table-column>
      <el-table-column prop="padThreshold" label="pad卡控" :key="queryParams.padThreshold" align="center"
                       min-width="50px"
      >
        {{ queryParams.padThreshold }}
      </el-table-column>
      <el-table-column prop="wireLen" label="金线长" align="center" min-width="50px">
      </el-table-column>
      <el-table-column prop="checkPort" label="校验值" align="center" min-width="40px">
      </el-table-column>
      <el-table-column prop="pId" label="产品序号" align="center" min-width="40px">
      </el-table-column>

      <el-table-column prop="operation" label="操作" fixed="right" align="center" width="108px">
        <template slot-scope="scope">
          <el-button type="danger" @click="toggleSelection([dataList[scope.$index]])">删除<i
            class="el-icon-remove-outline"
          ></i></el-button>
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

  </div>
</template>

<script>
import { pickerOptionsSet8 } from '@/views/biz/common/js/pickerOptionsConfig'
import { bodyCellStyle, headerCellStyle, tableStyle } from '@/views/biz/common/js/tableStyles'
import { checkDtRange, dateToStr} from '@/views/biz/common/js/utils';
import { listUpload, addOnline } from '@/api/biz/wb/upload'
import RightToolBarDownload from '@/views/biz/common/RightToolBarDownload'

export default {
  name: 'UploadModOnline',
  components: { RightToolBarDownload },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 已提交禁用
      hadSubmit: true,
      // 提交按钮文本
      submitText: '提 交 模 板',
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 标准模版明细表格数据
      dataList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 时间选择器范围
      pickerOptions: pickerOptionsSet8,

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        mcId: null,
        simId: null,
        pId: null,
        beginTime: null,
        endTime: null,
        delLineNoStr: '',
        // lead阈值
        leadThreshold: 50,
        // pad阈值
        padThreshold: 10,
        dtRange: []
      },
      delLineNo: new Set(),
      delBtnType: true,
      // 表单校验
      rules: {
        dtRange: [
          {
            type: 'array',
            required: true,
            message: '请选择日期区间',
            trigger: 'blur',
            fields: {
              // type类型试情况而定,所以如果返回的是date就改成date
              0: { type: 'string', required: true, message: '请选择开始日期' },
              1: { type: 'string', required: true, message: '请选择结束日期' }
            }
          }, {
            validator: (rule, value, callback) => {
              // 调用 checkDtRange 方法并指定 intervalDays 的值
              checkDtRange(rule, value, callback, 15, 'minute'); // 指定 intervalDays 为 60 天
            }, trigger: 'blur',
          }]
      }
    }
  },

  created() {
    // 日期区间回显
    this.$set(this.queryParams, 'dtRange', [dateToStr(new Date(new Date().valueOf() - 5 * 60 * 1000)), dateToStr(new Date(new Date().valueOf()))])
  },

  mounted() {
    this.getList()
  },

  methods: {
    headerCellStyle,
    bodyCellStyle,
    tableStyle,
    getList() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.loading = true
          this.queryParams.params = {}
          if (null != this.queryParams.dtRange && '' !== this.queryParams.dtRange) {
            this.queryParams.params['beginCreateDate'] = this.queryParams.dtRange[0]
            this.queryParams.params['endCreateDate'] = this.queryParams.dtRange[1]
            listUpload(this.queryParams).then(response => {
              this.dataList = response.rows
              this.total = response.total
              this.loading = false    // 关闭加载动效必须写在回调函数的内部
            })
          }
        }
      })
    },

    submitBtn() {
      this.hadSubmit = (this.queryParams.simId === null || this.queryParams.simId === '') && (this.queryParams.mcId === null || this.queryParams.mcId === '')
    },

    /** 在线提交 */
    onlineSubmit() {
      this.$modal.confirm('将向服务器提交模板数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        if (null != this.queryParams.dtRange && '' !== this.queryParams.dtRange) {
          this.queryParams.beginTime = this.queryParams.dtRange[0]
          this.queryParams.endTime = this.queryParams.dtRange[1]

          addOnline(this.queryParams).then(response => {
            this.hadSubmit = true
            this.submitText = '已 提 交 模 版'
            if (response.data.flag === '1') {
              this.loading = false
              this.$modal.alertSuccess(response.data.result)
              this.$router.push('/biz/wb/maintain/info')
            } else if (response.data.flag === '0') {
              this.loading = false
              this.$modal.alertError(response.data.result)
              this.hadSubmit = false
              this.submitText = '提 交 模 版'
            } else {
              this.loading = false
              this.$modal.alertError('未知错误，标准模版提交失败！')
              this.hadSubmit = false
              this.submitText = '提 交 模 版'
            }
          })
        } else {
          this.loading = false
          this.$modal.alertError('请选择时间范围！')
          this.hadSubmit = false
          this.submitText = '提 交 模 版'

        }
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        simId: null,
        mcId: null,
        pId: null,
        leadThreshold: null,
        padThreshold: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.hadSubmit = true
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.sid)
      this.mcIds = selection.map(item => item.mcId)
      this.single = selection.length !== 1
      this.multiple = !selection.length

      this.delLineNo.clear()
      for (let i = 0; i < selection.length; i++) {
        this.delLineNo.add(selection[i].lineNo)
      }

      let delLineNoTmp = ''
      let j = 0
      this.queryParams.delLineNoStr = ''
      for (let item of this.delLineNo.keys()) {
        if (j === 0) {
          delLineNoTmp += item.toString()
          j++
        } else {
          delLineNoTmp += ',' + item.toString()
          j++
        }
      }
      this.queryParams.delLineNoStr = delLineNoTmp
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('wb/olp/upload/export', {
        ...this.queryParams
      }, `comparison_${new Date().getTime()}.xlsx`)
    },

    toggleSelection(row) {   //取消选中
      this.$nextTick(() => {  // 页面挂载完成后操作dom
          if (row) {
            row.forEach(r => {
              this.$refs.multipleTable.toggleRowSelection(r)  // 第二个参数为true时，则不能第二次点击取消
            })
          } else {
            this.$refs.multipleTable.clearSelection()
          }
          this.delBtnType = !this.delLineNo
        }
      )
    },
  },

  watch: {
    menuTree() {
      ++this.queryParams.leadThreshold
      ++this.queryParams.padThreshold
    }
  }
}
</script>

