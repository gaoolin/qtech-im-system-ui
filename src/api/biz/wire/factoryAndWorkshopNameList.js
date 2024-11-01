import request from "@/utils/request"

// 获取工厂名
export function factoryNameList() {
  return request({
    url: '/qtech/im/factoryNames/wire',
    method: 'get'
  })
}

// 根据工厂名获取区名
export function workshopNameList(query) {
  return request({
    url: '/qtech/im/groupNames/wire',
    method: 'get',
    params: query
  })
}
