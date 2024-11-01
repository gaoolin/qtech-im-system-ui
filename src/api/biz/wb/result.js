import request from '@/utils/request'

export function listEqInfo(query) {
  return request({
    url: '/wb/olp/chk/list/eqInfo',
    method: 'get',
    params: query
  })
}

export function listWbComparison(query) {
  return request({
    url: '/wb/olp/chk/list/wbOlp',
    method: 'get',
    params: query
  })
}
