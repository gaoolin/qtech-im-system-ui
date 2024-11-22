import request from '@/utils/request'

export function listEqStatus(query) {
  return request({
    url: '/eqn/status/list',
    method: 'get',
    params: query
  })
}

// 查询离线设备
export function listOfflineEqs(query) {
  return request({
    url: '/eqn/status/offlineEqs',
    method: 'get',
    params: query
  })
}

// 查询设备在线、离线、总数信息
export function listEqInfo(query) {
  return request({
    url: '/eqn/status/agg',
    method: 'get',
    params: query
  })
}
