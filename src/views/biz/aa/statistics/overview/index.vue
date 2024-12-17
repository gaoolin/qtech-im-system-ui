<template>
  <div class="app-container">
    <h1 style="text-align:center; margin-top: 0; padding-top: 0; font-weight: bolder">AA List参数点检概览</h1>
    <el-form ref="queryForm" :model="queryParams" :inline="true" v-show="showSearch" label-width="68px"
      label-position="right">
      <el-form-item label="厂区" prop="factoryName">
        <el-select v-model="queryParams.factoryName" placeholder="请选择厂区" @change="handleFactoryChange"
                   clearable filterable>
          <el-option v-for="item in factoryNameOptions" :key="item.id" :label="item.name" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="车间" prop="groupName" v-if="groupNameOptions.length > 0">
        <el-select v-model="queryParams.groupName" placeholder="请输入车间" @focus="checkPreInput" @change="handleQuery" clearable filterable>
          <el-option v-for="item in groupNameOptions" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>
      </el-form-item>

      <el-form-item label="时段" prop="dtRange">
        <el-date-picker v-model="queryParams.dtRange" :range-separator="'-'" :start-placeholder="'开始时间'"
                        :end-placeholder="'结束时间'" :default-time="['00:00:00', '23:59:59']"
                        :clearable="false" :picker-options="pickerOptions" size="small" style="width: 240px" :value-format="'yyyy-MM-dd HH:mm:ss'" type="daterange" @change="onDateChange">
        </el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="5" class="mb5" type="flex" align="middle">
      <el-col :span="12" style="font-weight: bolder">
        更新时间：<span style="color: red;">{{ updateTime === null ? '-' : updateTime }}</span>
      </el-col>

      <el-col :span="12">
        <right-tool-bar-download :showSearch.sync="showSearch" @queryTable="getList"
          @handleExport="handleExport"></right-tool-bar-download>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="tableData" border :span-method="arraySpanMethod" :cell-style="tableBodyCellStyle"
      :header-cell-style="tableHeaderCellStyle" :row-style="{ height: '25px' }" >
      <el-table-column prop="factoryName" label="厂区" align="center" min-width="100" />
      <el-table-column prop="groupName" label="车间" align="center" min-width="120" fit />
      <el-table-column prop="ttlEqs" label="设备总数" align="center" min-width="60">
        <template slot-scope="scope">
          <span v-if="scope.row.ttlEqs > 0">{{ numberToCurrencyNo(scope.row.ttlEqs) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="onlineEqs" label="联网机台数" align="center" min-width="60">
        <template slot-scope="scope">
          <span v-if="scope.row.onlineEqs > 0">{{ numberToCurrencyNo(scope.row.onlineEqs) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="offlineEqs" label="未联网机台数" align="center" min-width="60">
        <template slot-scope="scope">
          <router-link :to="{
            path: '/biz/eqn/networking', query: {
              factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
              groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
              deviceType: 'AA',
              netStatus: 0
            }
          }">
            <span v-if="scope.row.offlineEqs > 0">{{ numberToCurrencyNo(scope.row.offlineEqs) }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="chkCnt" label="比对次数" align="center" min-width="80">
        <!-- 注意：router-link中链接如果是'/'开始就是从根路由开始，如果开始不带'/'，则从当前路由开始。 -->
        <template slot-scope="scope">
          <span v-if="scope.row.chkCnt > 0">{{ numberToCurrencyNo(scope.row.chkCnt) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="okCnt" label="正确次数" align="center" min-width="80">
        <template slot-scope="scope">
          <router-link :to="{
            path: '/biz/aa/statistics/percentage', query: {
              dtRange: queryParams.dtRange,
              factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
              groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
              flag: 'ok'
            }
          }">
            <span v-if="scope.row.okCnt > 0">{{ numberToCurrencyNo(scope.row.okCnt) }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="异常信息" align="center">
        <el-table-column prop="errCnt" label="错误次数" align="center">
          <template slot-scope="scope">
            <router-link :to="{
              path: '/biz/aa/statistics/percentage', query: {
                dtRange: queryParams.dtRange,
                factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
                groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
                flag: 'err'
              }
            }">
              <span v-if="scope.row.errCnt > 0">{{ numberToCurrencyNo(scope.row.errCnt) }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="lackParamsCnt" label="少参数" align="center" fit>
          <template slot-scope="scope">
            <router-link :to="{
              path: '/biz/aa/statistics/particulars', query: {
                dtRange: queryParams.dtRange,
                factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
                groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
                statusCode: 2
              }
            }">
              <span v-if="scope.row.lackParamsCnt > 0">{{ numberToCurrencyNo(scope.row.lackParamsCnt) }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="unsuitableCnt" label="值异常" align="center" fit>
          <template slot-scope="scope">
            <router-link :to="{
              path: '/biz/aa/statistics/particulars', query: {
                dtRange: queryParams.dtRange,
                factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
                groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
                statusCode: 3
              }
            }">
              <span v-if="scope.row.unsuitableCnt > 0">{{ numberToCurrencyNo(scope.row.unsuitableCnt) }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="overflowCnt" label="多参数" align="center" fit>
          <template slot-scope="scope">
            <router-link :to="{
              path: '/biz/aa/statistics/particulars', query: {
                dtRange: queryParams.dtRange,
                factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
                groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
                statusCode: 4
              }
            }">
              <span v-if="scope.row.overflowCnt > 0">{{ numberToCurrencyNo(scope.row.overflowCnt) }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="compErrCnt" label="复合异常" align="center" fit>
          <template slot-scope="scope">
            <router-link :to="{
              path: '/biz/aa/statistics/particulars', query: {
                dtRange: queryParams.dtRange,
                factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
                groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
                statusCode: 5
              }
            }">
              <span v-if="scope.row.compErrCnt > 0">{{ numberToCurrencyNo(scope.row.compErrCnt) }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="模版异常" align="center" fit>
          <template slot-scope="scope">
            <router-link :to="{
              path: '/biz/aa/statistics/particulars', query: {
                dtRange: queryParams.dtRange,
                factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
                groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
                flag: 'tplErr'
              }
            }">
              <span v-if="(scope.row.offlineTplCnt + scope.row.lackTplDetailCnt + scope.row.noTplCnt) > 0">{{
                numberToCurrencyNo(scope.row.offlineTplCnt + scope.row.lackTplDetailCnt + scope.row.noTplCnt) }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="errRatio" label="错误率" align="center" fit>
          <template slot-scope="scope">
            <span>{{ scope.row.errRatio > 0 ? toPercent(getBit(scope.row.errRatio, 6), 2) : '-' }}</span>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { pickerOptionsSet9 } from '@/views/biz/common/js/pickerOptionsConfig'
import { fetchList, getUpdateTime } from '@/api/biz/aa/index/index'
import {
  fetchHistoryFactoryNames,
  fetchLatestFactoryNames,
  fetchLatestGroupNames
} from '@/api/biz/common/factoryAndGroupNames'
import { getBit, toPercent, numberToCurrencyNo, dateToStr, arraySpanMethod, checkDtRange, mergeAction, rowMergeHandle } from '@/views/biz/common/js/utils'
import { listEqInfo } from '@/api/biz/eqn/networking'
import RightToolBarDownload from '@/views/biz/common/RightToolBarDownload'

export default {
  components: { RightToolBarDownload },
  data() {
    return {
      loading: false,
      showSearch: true,
      pickerOptions: pickerOptionsSet9,
      queryParams: {
        dtRange: null,
        factoryName: null,
        groupName: null
      },
      // 厂选择器
      factoryNameOptions: [],
      // 区选择器
      groupNameOptions: [],
      tableData: [],
      // 需要合并项的列
      needMergeArr: [
        {
          colName: 'factoryName',
          mergeCheckNames: ['factoryName']
        },
        {
          colName: 'groupName',
          mergeCheckNames: ['factoryName', 'groupName']
        }
      ],
      rowMergeArrs: {}, // 包含需要一个或多个合并项信息的对象
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
              checkDtRange(rule, value, callback, 365, 'day') // 指定 intervalDays 为 60 天
            }, trigger: 'blur'
          }]
      },
      updateTime: null,

    }
  },

  methods: {
    getBit,
    toPercent,
    numberToCurrencyNo,

    getList() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.loading = true
          this.queryParams.params = {}
          if (Array.isArray(this.queryParams.dtRange) && this.queryParams.dtRange.length === 2) {
            this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
            this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          }

          const fetchData = async () => {
            try {
              const [overviewData, eqInfoData] = await Promise.all([
                fetchList(this.queryParams),
                listEqInfo({ deviceType: 'AA' })
              ])
              // console.log(overviewData)
              // console.log(eqInfoData)
              const eqInfoMap = eqInfoData.rows.reduce((map, item) => {
                map[`${item.factoryName}-${item.groupName}`] = item
                return map
              }, {})

              overviewData.rows.forEach(overviewItem => {
                const key = `${overviewItem.factoryName}-${overviewItem.groupName}`
                const eqInfoItem = eqInfoMap[key]
                if (eqInfoItem) {
                  overviewItem.ttlEqs = eqInfoItem.ttlEqs
                  overviewItem.offlineEqs = eqInfoItem.offlineEqs
                  overviewItem.onlineEqs = overviewItem.ttlEqs - overviewItem.offlineEqs
                }
              })
              this.tableData = overviewData.rows
            } catch (err) {
              console.error('Error fetching data:', err)
            } finally {
              this.loading = false
              this.getUpdateTime()
            }
          }
          fetchData()
            .then(() => {
              // 处理合并项
              // this.rowMergeArrs = rowMergeHandle(this.needMergeArr, this.tableData)
            })
        }
      })
    },

    getUpdateTime() {
      getUpdateTime().then(response => {
        /* AjaxResult success(code, msg) */
        this.updateTime = response.msg
      })
    },

    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },

    handleExport() {
      this.download('/aa/params/index/export', {
        ...this.queryParams
      }, `AA参数点检概览_${new Date().getTime()}.xlsx`)
    },

    getFactoryNames() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.factoryNameOptions = []
          this.queryParams.params = {}
          this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
          this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          fetchHistoryFactoryNames(this.queryParams).then(response => {
            if (!response.data || response.data.length === 0) {
              return
            }
            for (let index = 0; index < response.data.length; index++) {
              const factory = response.data[index]
              const option = {
                id: index + 1,
                name: factory['factoryName']
              }
              if (option.name === this.queryParams.factoryName) {
                // 将该项目插入到 factoryNameOptions 数组的最前面
                this.factoryNameOptions.unshift(option)
              } else {
                this.factoryNameOptions.push(option)
              }
            }
          }).catch(error => {
            console.error('获取厂区列表失败:', error)
          })
        }
      })
    },

    /** 获取车间列表 */
    getGroupNames() {
      this.groupNameOptions = []

      if (!this.queryParams.factoryName) {
        return
      }

      fetchLatestGroupNames(this.queryParams).then(response => {
        if (!response.data || response.data.length === 0) {
          return
        }
        for (let index = 0; index < response.data.length; index++) {
          const group = response.data[index]
          const option = {
            id: index + 1,
            name: group['groupName']
          }
          if (option.name === this.queryParams.groupName) {
            // 将该项目插入到 groupNameOptions 数组的最前面
            this.groupNameOptions.unshift(option)
          } else {
            this.groupNameOptions.push(option)
          }
        }
      }).catch(error => {
        console.error('获取组名列表失败:', error)
      })
    },

    onDateChange(value) {
      this.getFactoryNames();
      this.handleQuery();
    },

    /** 获取厂区列表 */
    async handleFactoryChange() {
      if (this.queryParams.factoryName) {
        // 加载车间数据
        await this.getGroupNames()
      }
      this.queryParams.groupName = null
      this.handleQuery()
    },

    checkPreInput(e) {
      if (!this.queryParams.factoryName) {
        // 根据事件类型进行不同的处理
        const eventType = e && e.type ? e.type : 'unknown';
        switch (eventType) {
          case 'focus':
            // 处理 change 事件
            this.groupNameOptions = []
            break;
          default:
            // 处理其他事件类型
            break;
        }
        this.$message.error('请先选择厂区')
        return
      }
    },

    /** 样式控制方法 */
    tableBodyCellStyle({ row, column, rowIndex, columnIndex }) {
      if (row.factoryName === '总计') {
        return 'background: #DDDDDD; color: #00008B; font-size: 21px; font-weight: bolder;'
      } else if (row.groupName === '小计') {
        return 'background: #DDDDDD; font-size: 20px; font-weight: bolder;'
      } else if (columnIndex === 4 && row[column.property] > 0) {
        return 'background: #FFBB00; color: #FFFFFF; font-size: 19px; font-weight: bolder; text-decoration: underline;'
      } else if (columnIndex === 6 && row[column.property] > 0) {
        return 'background:#228B22; color: #FFFFFF; font-size: 19px; font-weight: bolder; text-decoration: underline;'
      } else if (columnIndex === 7 && row[column.property] > 0) {
        return 'background: orangered; color: #FFFFFF; font-size: 19px; font-weight: bolder; text-decoration: underline;'
      } else if ((columnIndex > 7 && columnIndex < 12) && row[column.property] > 0) {
        return 'font-size: 19px; font-weight: bolder; text-decoration: underline;'
      } else if (columnIndex === 12 && (row.offlineTplCnt + row.lackTplDetailCnt + row.noTplCnt) > 0) {
        return 'font-size: 19px; font-weight: bolder; text-decoration: underline;'
      } else if (columnIndex === 13 && row[column.property] > 0) {
        return 'color: red; font-size: 19px; font-weight: bolder;'
      } else {
        return 'font-size: 20px; font-weight: bolder;'
      }
    },

    tableHeaderCellStyle({ row, column, rowIndex, columnIndex }) {
      let cellStyle1
      let cellStyle2
      let cellStyle3

      cellStyle1 = 'font-size: 21px; font-weight: bolder; color: #fff; background: #436EEE'
      cellStyle2 = 'font-size: 21px; font-weight: bolder; color: #fff; background: orangered'
      cellStyle3 = 'font-size: 21px; font-weight: bolder; color: #fff; background: #00BFBF'

      if (columnIndex >= 0 && columnIndex < 7 && rowIndex === 0) {
        return cellStyle1
      }
      if (columnIndex >= 0 && columnIndex < 9 && rowIndex === 1) {
        return cellStyle1
      }
      if (rowIndex === 0) {
        return cellStyle2
      }
    },

    handleWorkshopChange() {
      // 模拟加载产线数据
      this.handleQuery()
      this.loadOverviewChart()
    },

    loadOverviewChart() {
      // 模拟全局厂区、车间数据
      const option = {
        title: { text: '厂区设备状态概览' },
        tooltip: {},
        legend: { data: ['正常', '异常', '警告'] },
        series: [
          {
            name: '状态',
            type: 'pie',
            data: [
              { value: 1048, name: '正常' },
              { value: 735, name: '异常' },
              { value: 580, name: '警告' }
            ]
          }
        ]
      }
    },

    loadDetailChart() {
      // 模拟设备详细数据
      const option = {
        title: { text: '产线设备状态详情' },
        tooltip: {},
        xAxis: { type: 'category', data: ['设备1', '设备2', '设备3'] },
        yAxis: { type: 'value' },
        series: [
          {
            name: '状态',
            type: 'bar',
            data: [80, 70, 60]
          }
        ]
      }
    }
  },

  mounted() {
    this.getFactoryNames()
    this.getList()
  },

  created() {
    this.$set(this.queryParams, 'dtRange', [dateToStr(new Date(new Date().setHours(0, 0, 0).valueOf())),
    dateToStr(new Date(new Date().setHours(23, 59, 59).valueOf()))])
  },


  computed: {
    arraySpanMethod() {
      return (params) => {
        return arraySpanMethod(params, this.needMergeArr, (val, rowIndex, colData) => {
          return mergeAction(val, rowIndex, colData, this.rowMergeArrs)
        })
      }
    }
  },

  watch: {
    tableData: {
      deep: true,
      handler() {
        this.rowMergeArrs = rowMergeHandle(this.needMergeArr, this.tableData)
      }
    }
  }
}

</script>

<style scoped>
::v-deep .el-table {
  margin-top: 5px;
}

::v-deep .el-form-item {
  margin-top: 5px;
  margin-bottom: 5px !important;
}

/*.table-content-font {
  font-size: 20px;
  color: #ff007b;
}*/

.table-link-font {
  font-size: 19px;
  font-weight: bolder;
}

a:link {
  /*text-decoration: underline;*/
  /*color: brown;*/
}

a:visited {
  /*下划线*/
  /*text-decoration: none;*/
  /*color: brown;*/
}

a:hover {
  font-size: 25px;
  /*text-decoration: none;*/
  /*color: #00afff;*/
}

a:active {
  /*text-decoration: none;*/
  color: black;
}
</style>

