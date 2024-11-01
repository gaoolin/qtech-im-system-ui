import request from "@/utils/request"

// 获取工厂名
export function fetchWireFactoryNames(query) {
  return request({
    url: '/qtech/im/factoryNames/wire',
    method: 'get',
    params: query
  })
}

// 根据工厂名获取区名
export function fetchWireGroupNames(query) {
  return request({
    url: '/qtech/im/groupNames/wire',
    method: 'get',
    params: query
  })
}