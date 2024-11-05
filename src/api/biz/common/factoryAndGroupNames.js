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

// 打线图概览
export function fetchWbOlpOverviewFactoryNames(query) {
  return request({
    url: '/qtech/im/factoryNames/wb/olp',
    method: 'get',
    params: query
  })
}

export function fetchWbOlpOverviewGroupNames(query) {
  return request({
    url: '/qtech/im/groupNames/wb/olp',
    method: 'get',
    params: query
  })
}

// 打线图比对结果
export function fetchWbOlpLatestResultFactoryNames(query) {
  return request({
    url: '/qtech/im/factoryNames/wb/olp/latest',
    method: 'get',
    params: query
  })
}

export function fetchWbOlpLatestResultGroupNames(query) {
  return request({
    url: '/qtech/im/groupNames/wb/olp/latest',
    method: 'get',
    params: query
  })
}