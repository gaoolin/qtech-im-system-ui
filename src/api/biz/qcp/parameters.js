import request from '@/utils/request'

// 查询qcp参数
export function listQcpOverview(query) {
  return request({
    url: '/qcp/params/overview',
    method: 'get',
    params: query
  })
}

// 查询qcp无参数模版明细
export function listQcpParams(query) {
  return request({
    url: '/qcp/params/list',
    method: 'get',
    params: query
  })
}

// 获取数据最大时间
export function getDataMaxTime() {
  return request({
    url: '/qcp/params/maxTime',
    method: 'get'
  })
}
