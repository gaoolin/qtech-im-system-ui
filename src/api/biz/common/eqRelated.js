import request from "@/utils/request"

// 检查数采数据是否持续更新
export function fetchDataStatus(query) {
  return request({
    url: '/qtech/im/eqs/iot/status',
    method: 'get',
    params: query
  })
}