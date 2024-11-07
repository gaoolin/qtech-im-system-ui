/**
 * 小数转换为百分比字符串
 * @param {number} point - 小数
 * @param {number} [n=2] - 保留小数位数，默认2
 * @returns {string} 百分比字符串
 */
export function toPercent(point, n = 2) {
  return `${Number(point * 100).toFixed(n)}%`
}

/**
 * 四舍五入保留指定小数位数
 * @param {string|number} value - 数值
 * @param {number} [bit=2] - 保留小数位数，默认2
 * @returns {string|null} 格式化后的字符串或null
 */
export function getBit(value, bit = 2) {
  if (value != null && value !== '') {
    return Number(value).toFixed(bit)
  }
  return null
}

/**
 * 验证是否为有效数字字符串
 * @param {string} val - 字符串
 * @returns {boolean} 是否为有效数字
 */
export function isNumberStr(val) {
  return /^\d+(\.\d{1,2})?$/.test(val)
}

/**
 * 计算两个日期之间的时间差
 * @param {Date|string} date1 - 第一个日期
 * @param {Date|string} date2 - 第二个日期
 * @param {string} [unit='day'] - 时间单位，默认为天（day），可选值为 day, hour, minute, second
 * @returns {number} 时间差
 */
function getDistanceOfDt(date1, date2, unit = 'day') {
  const msDiff = Math.abs(Date.parse(date1) - Date.parse(date2))

  let diff
  switch (unit) {
    case 'day':
      diff = Math.floor(msDiff / (1000 * 3600 * 24))
      break
    case 'hour':
      diff = Math.floor(msDiff / (1000 * 3600))
      break
    case 'minute':
      diff = Math.floor(msDiff / (1000 * 60))
      break
    case 'second':
      diff = Math.floor(msDiff / 1000)
      break
    default:
      throw new Error('无效的时间单位')
  }

  return diff
}

/**
 * 检查日期区间是否合法
 * @param {Object} rule - 规则对象
 * @param {Array<Date|string>} value - 日期数组
 * @param {Function} callback - 回调函数
 * @param {number} [intervalValue=30] - 时间跨度值，默认30
 * @param {string} [unit='day'] - 时间单位，默认为天（day），可选值为 day, hour, minute, second
 */
export function checkDtRange(rule, value, callback, intervalValue = 30, unit = 'day') {
  if (!value || value.length < 2) {
    return callback(new Error('请选择日期区间'))
  }

  const diff = getDistanceOfDt(value[0], value[1], unit)

  if (diff > intervalValue) {
    return callback(new Error(`时间跨度不能超过${intervalValue} ${unit}s`))
  }
  callback()
}

/**
 * 必填项校验方法
 * 
 * @param {Object} rule - 校验规则对象，通常由表单验证框架提供
 * @param {any} value - 当前输入的值
 * @param {Function} callback - 回调函数，用于返回校验结果
 * 
 * @example
 * rules: [
 *   { required: true, validator: requiredValidator, trigger: 'blur' }
 * ]
 */
 export function requiredValidator(rule, value, callback) {
  // 检查输入值是否为空
  if (!value) {
    // 如果输入值为空，调用回调函数并传递错误信息
    callback(new Error('需要输入值'));
  } else {
    // 如果输入值不为空，调用回调函数表示校验通过
    callback();
  }
}

/** 表格合并行 */
/**
 * 表格合并行方法
 * @param {Object} params - 参数对象
 * @param {Array} params.row - 当前行数据
 * @param {Object} params.column - 列对象
 * @param {number} params.rowIndex - 当前行索引
 * @param {number} params.columnIndex - 当前列索引
 * @param {Array} needMergeArr - 需要合并的列配置
 * @param {Function} mergeAction - 合并操作函数
 * @returns {Array} 返回合并结果
 */
export function arraySpanMethod({ row, column, rowIndex, columnIndex }, needMergeArr, mergeAction) {
  let needMerge = needMergeArr.some((item) => {
    return item.colName === column.property
  })

  if (needMerge === true) {
    return mergeAction(column.property, rowIndex, column)
  }
}

/**
 * 合并操作函数
 * @param {string} val - 列属性名
 * @param {number} rowIndex - 当前行索引
 * @param {Object} colData - 列数据
 * @param {Object} rowMergeArrs - 合并行数据对象
 * @returns {Array} 返回合并结果
 */
export function mergeAction(val, rowIndex, colData, rowMergeArrs) {
  if (typeof val !== 'string') {
    throw new TypeError('val must be a string')
  }
  if (typeof rowIndex !== 'number') {
    throw new TypeError('rowIndex must be a number')
  }
  if (typeof colData !== 'object' || colData === null) {
    throw new TypeError('colData must be an object')
  }
  if (typeof rowMergeArrs !== 'object' || rowMergeArrs === null) {
    throw new TypeError('rowMergeArrs must be an object')
  }

  let _row = rowMergeArrs[val].rowArr[rowIndex]
  let _col = _row > 0 ? 1 : 0
  return [_row, _col]
}

/**
 * 行合并处理函数
 * @param {Array} arr - 合并配置数组
 * @param {Array} data - 数据数组
 * @returns {Object} 返回合并行数据对象
 */
export function rowMergeHandle(arr, data) {
  if (!Array.isArray(arr) || !arr.length) return false
  if (!Array.isArray(data) || !data.length) return false

  let needMerge = {}

  arr.forEach((mergeItem) => {
    // 创建合并管理对象
    needMerge[mergeItem.colName] = {
      rowArr: [],
      rowMergeNum: 0
    }

    let currentMergeItemData = needMerge[mergeItem.colName]

    // 进行合并管理对象数据的遍历整理
    data.forEach((item, index) => {
      if (index === 0) {
        currentMergeItemData.rowArr.push(1)
        currentMergeItemData.rowMergeNum = 0
      } else {
        let currentRowData = data[index]
        let preRowData = data[index - 1]

        if (colMergeCheck(currentRowData, preRowData, mergeItem.mergeCheckNames)) {
          currentMergeItemData.rowArr[currentMergeItemData.rowMergeNum] += 1
          currentMergeItemData.rowArr.push(0)
        } else {
          currentMergeItemData.rowArr.push(1)
          currentMergeItemData.rowMergeNum = index
        }
      }
    })
  })

  return needMerge
}

/**
 * 列合并检查函数
 * @param {Object} currentRowData - 当前行数据
 * @param {Object} preRowData - 前一行数据
 * @param {Array} mergeCheckNames - 合并检查属性名数组
 * @returns {boolean} 返回检查结果
 */
export function colMergeCheck(currentRowData, preRowData, mergeCheckNames) {
  if (!Array.isArray(mergeCheckNames) || !mergeCheckNames.length) return false
  let result = true

  for (let index = 0; index < mergeCheckNames.length; index++) {
    const mergeCheckName = mergeCheckNames[index]
    if (currentRowData[mergeCheckName] !== preRowData[mergeCheckName]) {
      result = false
      break
    }
  }

  return result
}

/**
 * 格式化文件大小
 * @param {number} size - 文件大小（以字节为单位）
 * @returns {string} 格式化后的文件大小字符串
 */
export function formatFileSize(size) {
  // 参数校验
  if (typeof size !== 'number' || isNaN(size)) {
    throw new Error('Invalid size provided')
  }

  const units = ['B', 'Kib', 'Mib', 'Gib', 'Tib']
  let unitIndex = 0

  // 动态确定单位
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  // 格式化输出
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

/** 字段校验规则 */
/**
 * @param rule
 * @param value
 * @param callback
 */
export function checkParamsRule(rule, value, callback) {
  if (!value) {
    // 如果值为空，则校验通过（视为可选）
    callback()
  }
  const allowedTypes = ['Enable', 'Disable', '']
  if (allowedTypes.includes(value)) {
    callback()
  } else {
    callback(new Error('请输入正确的参数值, 必须是Enable、Disable或空值'))
  }
}

/**
 * @param rule
 * @param value
 * @param callback
 */
export function checkNumericOrEmpty(rule, value, callback) {
  const numericPattern = /^-?\d+(\.\d+)?$/
  if (!value) {
    callback()
  } else if (numericPattern.test(value)) {
    callback()
  } else {
    callback(new Error('请输入数字或留空'))
  }
}

/**
 * 校验输入值是否为非数字的字符串或为空
 * @param rule
 * @param value
 * @param callback
 */
export function checkStringOrEmpty(rule, value, callback) {
  if (!value) {
    // 如果值为空，则校验通过（视为可选）
    callback()
  } else if (typeof value === 'string' && !/^-?\d+(\.\d+)?$/.test(value)) {
    // 检查值是否为字符串且不是数字形式的字符串
    callback()
  } else {
    callback(new Error('请输入非数字的字符串或留空'))
  }
}

/**
 * @param value
 * @returns {string|*}
 */
export function convertNull(value) {
  return value === null || value === undefined || '' ? '--' : value
}

/**
 * 对传入的数据对象或数组中的指定字段进行类型转换
 * @param {Object|Array} row - 需要处理的对象或对象数组
 * @param {Array} fieldsToConvert - 需要进行类型转换的字段名数组
 */
export function preTableDataDictObjConvert(row, fieldsToConvert) {
  // 内部方法：对单个对象进行字段转换
  const convertFields = (obj) => {
    // 遍历对象中的每个字段
    Object.keys(obj).forEach(field => {
      // 检查当前字段名是否在 fieldsToConvert 数组中
      if (fieldsToConvert.includes(field) && obj[field] != null && obj[field] !== '') {
        // 如果字段在 fieldsToConvert 中且字段值不为空，则将其转换为字符串
        obj[field] = obj[field].toString()
      }
    })
  }

  // 判断传入的 row 是否是数组
  if (Array.isArray(row)) {
    // 如果是数组，遍历数组中的每个对象
    row.forEach(item => {
      // 调用内部方法 convertFields 处理每个对象
      convertFields(item)
    })
  } else if (row != null && typeof row === 'object') {
    // 如果是单个对象，直接处理
    convertFields(row)
  }
}

export function formatDt(date) {
  if (date) {
    const formattedDate = new Date(date)
    const year = formattedDate.getFullYear()
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0')
    const day = String(formattedDate.getDate()).padStart(2, '0')
    const hours = String(formattedDate.getHours()).padStart(2, '0')
    const minutes = String(formattedDate.getMinutes()).padStart(2, '0')
    const seconds = String(formattedDate.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
  return null
}

/** 日期转字符串 */
/**
 * @param date
 * @returns {string}
 */
export function dateToStr(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const hours = date.getHours()
  const min = date.getMinutes()
  const second = date.getSeconds()
  return year + '-' +
    ((month + 1) > 9 ? (month + 1) : '0' + (month + 1)) + '-' +
    (day > 9 ? day : ('0' + day)) + ' ' +
    (hours > 9 ? hours : ('0' + hours)) + ':' +
    (min > 9 ? min : ('0' + min)) + ':' +
    (second > 9 ? second : ('0' + second))
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function numberToCurrencyNo(value) {
  if (!value) return 0
  // 获取整数部分
  const intPart = Math.trunc(value)
  // 整数部分处理，增加,
  const intPartFormat = intPart.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
  // 预定义小数部分
  let floatPart = ''
  // 将数值截取为小数部分和整数部分
  const valueArray = value.toString().split('.')
  if (valueArray.length === 2) { // 有小数部分
    floatPart = valueArray[1].toString() // 取得小数部分
    return intPartFormat + '.' + floatPart
  }
  return intPartFormat + floatPart
}
