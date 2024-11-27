<template>
  <div class="app-container center">
    <h1 style="text-align:center; margin-top: 0; padding-top: 0; font-weight: bolder">打线图比对数据概览</h1>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px"
      :rules="rules">
      <el-form-item label="厂区" prop="factoryName">
        <el-select v-model="queryParams.factoryName" placeholder="请输入厂区" clearable @change="handleFactoryChange">
          <el-option v-for="factory in factoryNameOptions" :key="factory.id" :label="factory.name"
            :value="factory.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="车间" prop="groupName">
        <el-select v-model="queryParams.groupName" placeholder="请输入车间" clearable  @focus="getGroupNames"
          @change="handleQuery">
          <el-option v-for="groupName in groupNameOptions" :key="groupName.id" :label="groupName.name"
            :value="groupName.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时段" prop="dtRange">
        <el-date-picker v-model="queryParams.dtRange" style="width: 340px" value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
          :picker-options="pickerOptions" @change="handleQuery"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!--  :span是每个元素所占此row比例，一行是24。:gutter是该row内元素之间的间隙，也就是col占6，gutter占6中的20px  -->
    <el-row :gutter="5" class="mb5" type="flex" align="middle">
      <el-col :span="12" style="font-weight: bolder">
        更新时间：<span style="color: red;">{{ updateTime === null ? '-' : updateTime }}</span>
      </el-col>

      <el-col :span="12">
        <right-tool-bar-download :showSearch.sync="showSearch" @queryTable="getList"
          @handleExport="handleExport"></right-tool-bar-download>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="tableData" border :span-method="arraySpanMethod" :cell-style="tableBodyCellStyle"
      :header-cell-style="tableHeaderCellStyle" :row-style="{ height: '25px' }" style="width: 100%; color: #363636">
      <el-table-column prop="factoryName" label="厂区" align="center" min-width="100" fit />
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
              deviceType: 'WB',
              label: 1
            }
          }">
            <span v-if="scope.row.offlineEqs > 0">{{ numberToCurrencyNo(scope.row.offlineEqs) }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="computeCnt" label="比对次数" align="center" min-width="80">
        <!-- 注意：router-link中链接如果是'/'开始就是从根路由开始，如果开始不带'/'，则从当前路由开始。 -->
        <template slot-scope="scope">
          <span v-if="scope.row.computeCnt > 0">{{ numberToCurrencyNo(scope.row.computeCnt) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="okCnt" label="正确次数" align="center" min-width="80">
        <template slot-scope="scope">
          <router-link :to="{
            path: '/biz/wb/statistics/percentage', query: {
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
              path: '/biz/wb/statistics/percentage', query: {
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
        <el-table-column prop="offsetCnt" label="金线偏移" align="center" fit>
          <template slot-scope="scope">
            <router-link :to="{
              path: '/biz/wb/statistics/particulars', query: {
                dtRange: queryParams.dtRange,
                factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
                groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
                statusCode: 1
              }
            }">
              <span v-if="scope.row.offsetCnt > 0">{{ numberToCurrencyNo(scope.row.offsetCnt) }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="npCnt" label="无线图模版" align="center" fit>
          <template slot-scope="scope">
            <router-link :to="{
              path: '/biz/wb/statistics/particulars', query: {
                dtRange: queryParams.dtRange,
                factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
                groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
                statusCode: 3
              }
            }">
              <span v-if="scope.row.npCnt > 0">{{ numberToCurrencyNo(scope.row.npCnt) }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="少线/多线" align="center" fit>
          <template slot-scope="scope">
            <span v-if="(scope.row.lackCnt + scope.row.overCnt) > 0">{{ numberToCurrencyNo(scope.row.lackCnt +
              scope.row.overCnt) }}</span>
          </template>
          <template slot-scope="scope">
            <router-link :to="{
              path: '/biz/wb/statistics/particulars', query: {
                dtRange: queryParams.dtRange,
                factoryName: scope.row.factoryName === '总计' ? '' : scope.row.factoryName,
                groupName: scope.row.groupName === '小计' ? '' : scope.row.groupName,
                statusCode: 5
              }
            }">
              <span v-if="(scope.row.lackCnt + scope.row.overCnt) > 0">{{ numberToCurrencyNo(scope.row.lackCnt +
                scope.row.overCnt) }}</span>
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
import { pickerOptionsSet1 } from '@/views/biz/common/js/pickerOptionsConfig'
import { arraySpanMethod, checkDtRange, getBit, numberToCurrencyNo, mergeAction, rowMergeHandle, toPercent, dateToStr } from '@/views/biz/common/js/utils'
import { getUpdateTime, listOverview } from '@/api/biz/wb/overview'
import { listEqInfo } from '@/api/biz/eqn/networking'
import { fetchWbOlpOverviewFactoryNames, fetchWbOlpOverviewGroupNames } from '@/api/biz/common/factoryAndGroupNames'
import RightToolBarDownload from '@/views/biz/common/RightToolBarDownload'

export default {
  name: 'index',
  components: { RightToolBarDownload },

  data() {
    return {
      // 显示搜索条件
      showSearch: true,
      loading: true,
      tableData: null,
      pickerOptions: pickerOptionsSet1,
      open: false,
      // 厂选择器
      factoryNameOptions: [],
      // 区选择器
      groupNameOptions: [],
      queryParams: {
        factoryName: null,
        groupName: null,
        dtRange: [],
        deviceType: 'WB'
      },
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
      updateTime: null
    }
  },

  created() {
    // 日期区间回显
    this.$set(this.queryParams, 'dtRange', [dateToStr(new Date(new Date().setHours(0, 0, 0).valueOf())), dateToStr(new Date(new Date().setHours(23, 59, 59).valueOf()))])
  },

  mounted() {
    this.getList()
    this.getFactoryNames(this.queryParams)
  },

  methods: {
    getBit, toPercent, numberToCurrencyNo,
    getList() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.loading = true
          this.queryParams.params = {}
          if (Array.isArray(this.queryParams.dtRange) && this.queryParams.dtRange.length === 2) {
            this.queryParams.params['beginDate'] = this.queryParams.dtRange[0]
            this.queryParams.params['endDate'] = this.queryParams.dtRange[1]

            const fetchData = async () => {
              try {
                const [overviewData, eqInfoData] = await Promise.all([
                  listOverview(this.queryParams),
                  listEqInfo({ deviceType: 'WB' })
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
          }
        }
      })
    },

    getFactoryNames() {
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.factoryNameOptions = []
          this.queryParams.params = {}
          this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
          this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          fetchWbOlpOverviewFactoryNames(this.queryParams).then(response => {
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

    getGroupNames() {
      this.groupNameOptions = []
      console.log(this.queryParams);
      if (!this.queryParams.factoryName) {
        this.$message.error('请先选择厂区')
        return
      }
      this.$refs['queryForm'].validate(valid => {
        if (valid) {
          this.queryParams.params = {}
          this.queryParams.params['beginTime'] = this.queryParams.dtRange[0]
          this.queryParams.params['endTime'] = this.queryParams.dtRange[1]
          fetchWbOlpOverviewGroupNames(this.queryParams).then(response => {
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
        }
      })
    },

    getUpdateTime() {
      getUpdateTime().then(response => {
        this.updateTime = response.data
      })
    },

    /** 样式控制方法 */
    tableBodyCellStyle({ row, column, rowIndex, columnIndex }) {
      if (row.factoryName === '总计') {
        return 'background: #DDDDDD; color: #00008B; font-size: 21px; font-weight: bolder;'
      } else if (row.groupName === '小计') {
        return 'background: #DDDDDD; font-size: 20px; font-weight: bolder;'
      } else if (columnIndex === 6 && row[column.property] > 0) {
        return 'background:#228B22; color: #FFFFFF; font-size: 19px; font-weight: bolder; text-decoration: underline;'
      } else if (columnIndex === 4 && row[column.property] > 0) {
        return 'background: #FFBB00; color: #FFFFFF; font-size: 19px; font-weight: bolder; text-decoration: underline;'
      } else if (columnIndex === 7 && row[column.property] > 0) {
        return 'background: orangered; color: #FFFFFF; font-size: 19px; font-weight: bolder; text-decoration: underline;'
      } else if ((columnIndex > 7 && columnIndex < 11) && row[column.property] > 0) {
        return 'font-size: 19px; font-weight: bolder; text-decoration: underline;'
      } else if (columnIndex === 11 && row[column.property] > 0) {
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
      if (columnIndex >= 0 && columnIndex < 5 && rowIndex === 1) {
        return cellStyle1
      }
      if (rowIndex === 0) {
        return cellStyle2
      }
    },

    /** 选取厂区列表时 */
    async handleFactoryChange() {
      if (this.queryParams.factoryName) {
        // 加载车间数据
        await this.getGroupNames()
      }
      this.queryParams.groupName = null
      this.handleQuery()
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },

    handleExport() {
      this.download('wb/olp/statistics/export', {
        ...this.queryParams
      }, `打线图比对概览_${new Date().getTime()}.xlsx`)
    }
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

<style lang="scss" scoped>
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
