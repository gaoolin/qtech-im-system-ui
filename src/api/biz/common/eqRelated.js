import request from "@/utils/request"

// 检查数采数据是否持续更新
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