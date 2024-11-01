import request from '@/utils/request'

// 查询比对错误率明细
export function listComparisonRatio(query) {
  return request({
    url: '/wb/olp/percentage/ratio',
    method: 'get',
    params: query
  })
}

// 查询比对明细
export function listComparisonDetail(query) {
  return request({
    url: '/wb/olp/particulars/detail',
    method: 'get',
    params: query
  })
}
