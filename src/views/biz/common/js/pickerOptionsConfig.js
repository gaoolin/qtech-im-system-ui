// src/pickerOptionsConfig.js
export const pickerOptionsSet1 = {
  shortcuts: [{
    text: '今天',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.setHours(0, 0, 0).valueOf())
      end.setTime(end.setHours(23, 59, 59).valueOf())
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '前一天',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      end.setTime(end.setHours(23, 59, 59) - 1 * 1440 * 60 * 1000)
      start.setTime(start.setTime(new Date().setHours(0, 0, 0) - 1 * 1440 * 60 * 1000))
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '前两天',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      end.setTime(end.setTime(new Date(end.setHours(23, 59, 59).valueOf() - 2 * 1440 * 60 * 1000).getTime()))
      start.setTime(start.setTime(new Date(start.setHours(0, 0, 0).valueOf() - 2 * 1440 * 60 * 1000).getTime()))
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '前三天',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      end.setTime(end.setHours(23, 59, 59).valueOf() - 3 * 1440 * 60 * 1000)
      start.setTime(start.setHours(0, 0, 0).valueOf() - 3 * 1440 * 60 * 1000)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '前一周',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      end.setTime(end.setHours(23, 59, 59).valueOf() - 7 * 1440 * 60 * 1000)
      start.setTime(start.setHours(0, 0, 0).valueOf() - 7 * 1440 * 60 * 1000)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '前一天至今',
    onClick(picker) {
      const end = new Date(new Date().setHours(23, 59, 59).valueOf())
      const start = new Date()
      start.setTime(start.setTime(new Date().setHours(0, 0, 0) - 1 * 1440 * 60 * 1000))
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '前两天至今',
    onClick(picker) {
      const end = new Date(new Date().setHours(23, 59, 59).valueOf())
      const start = new Date()
      start.setTime(start.setTime(new Date().setHours(0, 0, 0) - 2 * 1440 * 60 * 1000))
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '前三天至今',
    onClick(picker) {
      const end = new Date(new Date().setHours(23, 59, 59).valueOf())
      const start = new Date()
      start.setTime(start.setTime(new Date().setHours(0, 0, 0) - 3 * 1440 * 60 * 1000))
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '近一周',
    onClick(picker) {
      const end = new Date(new Date().setHours(23, 59, 59).valueOf())
      const start = new Date()
      start.setTime(start.setTime(new Date().setHours(0, 0, 0) - 7 * 1440 * 60 * 1000))
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '近一个月',
    onClick(picker) {
      const end = new Date(new Date().setHours(23, 59, 59).valueOf())
      const start = new Date()
      start.setTime(start.setTime(new Date().setHours(0, 0, 0) - 30 * 1440 * 60 * 1000))
      picker.$emit('pick', [start, end])
    }
  }]
};

export const pickerOptionsSet2 = {
  shortcuts: [{
    text: '最近一周',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '最近一个月',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '最近三个月',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '最近半年',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 180)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '最近一年',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
      picker.$emit('pick', [start, end])
    }
  }]
};

export const pickerOptionsSet3 = {
  shortcuts: [{
    text: '今天',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.setHours(0, 0, 0).valueOf())
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '前一天',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      end.setTime(end.setHours(23, 59, 59) - 1 * 1440 * 60 * 1000)
      start.setTime(start.setTime(new Date().setHours(0, 0, 0) - 1 * 1440 * 60 * 1000))
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '前两天',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      end.setTime(end.setTime(new Date(end.setHours(23, 59, 59).valueOf() - 2 * 1440 * 60 * 1000).getTime()))
      start.setTime(start.setTime(new Date(start.setHours(0, 0, 0).valueOf() - 2 * 1440 * 60 * 1000).getTime()))
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '前三天',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      end.setTime(end.setHours(23, 59, 59).valueOf() - 3 * 1440 * 60 * 1000)
      start.setTime(start.setHours(0, 0, 0).valueOf() - 3 * 1440 * 60 * 1000)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '前一周',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      end.setTime(end.setHours(23, 59, 59).valueOf() - 7 * 1440 * 60 * 1000)
      start.setTime(start.setHours(0, 0, 0).valueOf() - 7 * 1440 * 60 * 1000)
      picker.$emit('pick', [start, end])
    }
  }]
}

export const pickerOptionsSet4 = {
  shortcuts: [
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
}

export const pickerOptionsSet8 = {
  shortcuts: [{
    text: '近5分钟',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 60 * 1000 * 5)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '近10分钟',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 60 * 1000 * 10)
      end.setTime(end.getTime() - 60 * 1000 * 5)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '近15分钟',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 60 * 1000 * 15)
      end.setTime(end.getTime() - 60 * 1000 * 10)
      picker.$emit('pick', [start, end])
    }
  }]
};

// 你可以根据需要继续添加更多的 pickerOptions 配置组
