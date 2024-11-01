<template>
  <el-form-item style="width: 100%; margin: 0; padding: 0;" :label="label" :prop="prop" :label-width="labelWidth" :rules="rules">
    <el-date-picker
      v-model="queryParams.dtRange"
      style="width: 340px"
      value-format="yyyy-MM-dd HH:mm:ss"
      type="datetimerange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      :picker-options="pickerOptions"
    ></el-date-picker>
  </el-form-item>
</template>

<script>
export default {
  props: {
    label: String,
    prop: String,
    labelWidth: String,
    value: Array,
    startPlaceholder: {
      type: String,
      default: '开始日期'
    },
    endPlaceholder: {
      type: String,
      default: '结束日期'
    },
    maxSpanValue: {
      type: Number,
      default: 30 // 最大时间跨度数值，默认为30
    },
    maxSpanUnit: {
      type: String,
      default: 'minute' // 最大时间跨度单位，默认为分钟
    },
    required: {
      type: Boolean,
      default: true
    },
    enableShortcuts: {
      type: Boolean,
      default: true
    },
    pickerOptions: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: 'daterange', // 默认值为日期时间范围选择
      validator(value) {
        return ['daterange', 'datetimerange'].includes(value); // 验证type是否为指定的类型之一
      }
    },
    customWidth: {
      type: String,
      default: '' // 允许用户自定义输入框宽度
    }
  },
  data() {
    return {
      internalValue: this.value
    }
  },
  computed: {
    rules() {
      const rules = []
      if (this.required) {
        rules.push({ required: true, message: '请选择时间范围', trigger: 'change' })
      }
      rules.push({ validator: this.validateTimeSpan, trigger: 'change' })
      return rules
    },
    mergedPickerOptions() {
      const shortcuts = this.enableShortcuts
        ? [
          {
            text: '今天',
            onClick(picker) {
              const start = new Date()
              start.setHours(0, 0, 0, 0)
              const end = new Date()
              end.setHours(23, 59, 59, 999)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = new Date()
              start.setDate(start.getDate() - 1)
              start.setHours(0, 0, 0, 0)
              const end = new Date()
              end.setDate(end.getDate() - 1)
              end.setHours(23, 59, 59, 999)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近7天',
            onClick(picker) {
              const start = new Date()
              start.setDate(start.getDate() - 7)
              start.setHours(0, 0, 0, 0)
              const end = new Date()
              end.setHours(23, 59, 59, 999)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近30天',
            onClick(picker) {
              const start = new Date()
              start.setDate(start.getDate() - 30)
              start.setHours(0, 0, 0, 0)
              const end = new Date()
              end.setHours(23, 59, 59, 999)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '本月',
            onClick(picker) {
              const start = new Date()
              start.setDate(1)
              start.setHours(0, 0, 0, 0)
              const end = new Date()
              end.setMonth(end.getMonth() + 1, 0)
              end.setHours(23, 59, 59, 999)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '上个月',
            onClick(picker) {
              const start = new Date()
              start.setMonth(start.getMonth() - 1, 1)
              start.setHours(0, 0, 0, 0)
              const end = new Date()
              end.setMonth(end.getMonth(), 0)
              end.setHours(23, 59, 59, 999)
              picker.$emit('pick', [start, end])
            }
          }
        ]
        : []

      return {
        shortcuts,
        ...this.pickerOptions
      }
    },
    pickerType() {
      return this.type;
    },
    valueFormat() {
      return this.type === 'daterange' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss';
    },
    inputWidth() {
      if (this.type === 'daterange') {
        return this.customWidth ? this.customWidth : '290px';
      } else {
        return this.customWidth ? this.customWidth : '390px';
      }
    }
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
    },

    validateTimeSpan(rule, value, callback) {
      if (value && value.length === 2) {
        const [start, end] = value
        const startDate = new Date(start)
        const endDate = new Date(end)
        const diffMilliseconds = endDate - startDate

        // Convert maxSpanValue to milliseconds based on maxSpanUnit
        const maxSpanMilliseconds = this.convertToMilliseconds(this.maxSpanValue, this.maxSpanUnit)

        if (diffMilliseconds > maxSpanMilliseconds) {
          return callback(new Error(`时间跨度不能超过 ${this.maxSpanValue} ${this.maxSpanUnit}`))
        }
      }
      callback()
    },

    convertToMilliseconds(value, unit) {
      switch (unit) {
        case 'minute':
          return value * 60 * 1000
        case 'hour':
          return value * 60 * 60 * 1000
        case 'day':
          return value * 24 * 60 * 60 * 1000
        case 'week':
          return value * 7 * 24 * 60 * 60 * 1000
        case 'month':
          return value * this.daysInMonth(new Date()) * 24 * 60 * 60 * 1000
        default:
          return value
      }
    },

    daysInMonth(date) {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    },
  },

  created() {
    if (this.value && this.value.length === 2) {
      this.internalValue = this.value
    } else if (this.required) {
      const end = new Date()
      const start = new Date()
      start.setHours(0, 0, 0)
      end.setHours(23, 59, 59)
      this.internalValue = [start, end]
    }
  },

  watch: {
    value(newValue) {
      this.internalValue = newValue
    }
  }
}
</script>
