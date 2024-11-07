import request from '@/utils/request'

export function listHistoryCheckStatus(query) {
  return request({
    url: '/aa/params/history/status/list',
    method: 'get',
    params: query
  })
}

export function listLatestCheckStatus(query) {
  return request({
    url: '/aa/params/latest/status/list',
    method: 'get',
    params: query
  })
}
