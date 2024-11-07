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

// 设备联网
export function fetchEqnFactoryNames() {
  return request({
    url: '/qtech/im/factoryNames/eqn',
    method: 'get',
  })
}

export function fetchEqnGroupNames(query) {
  return request({
    url: '/qtech/im/groupNames/eqn',
    method: 'get',
    params: query
  })
}

// qcp 参数
export function fetchQcpFactoryNames() {
  return request({
    url: '/qtech/im/factoryNames/qcp',
    method: 'get',
  })
}

export function fetchQcpGroupNames(query) {
  return request({
    url: '/qtech/im/groupNames/qcp',
    method: 'get',
    params: query
  })
}

// aa 参数
export function fetchHistoryFactoryNames(query) {
  return request({
    url: '/qtech/im/factoryNames/aa/history',
    method: 'get',
    params: query
  })
}

export function fetchHistoryGroupNames(query) {
  return request({
    url: '/qtech/im/groupNames/aa/history',
    method: 'get',
    params: query
  })
}

export function fetchLatestFactoryNames(query) {
  return request({
    url: '/qtech/im/factoryNames/aa/latest',
    method: 'get',
    params: query
  })
}

export function fetchLatestGroupNames(query) {
  return request({
    url: '/qtech/im/groupNames/aa/latest',
    method: 'get',
    params: query
  })
}