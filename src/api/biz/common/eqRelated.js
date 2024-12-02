import request from "@/utils/request"

export function fetchDataStatus(query) {
  return request({
    url: '/qtech/im/eqs/iot/status',
    method: 'get',
    params: query
  })
}

// 检查AA数采数据是否持续更新
export function fetchAaDataStatus(query) {
  return request({
    url: '/qtech/im/eqs/iot/aa/status',
    method: 'get',
    params: query
  })
}

export function fetchQcpDataStatus(query) {
  return request({
    url: '/qtech/im/eqs/iot/qcp/status',
    method: 'get',
    params: query
  })
}
