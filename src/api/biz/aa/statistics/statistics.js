import request from '@/utils/request'

export function fetchHistoryFactoryNames(query) {
  return request({
    url: '/qtech/im/factoryNames/aa/history',
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

export function fetchHistoryGroupNames(query) {
  return request({
    url: '/qtech/im/groupNames/aa/history',
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
