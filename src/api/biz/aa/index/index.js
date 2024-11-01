import request from '@/utils/request'

export function fetchFactoryNames(query) {
  return request({
    url: '/qtech/im/factoryNames/aa/history',
    method: 'get',
    params: query
  })
}

export function fetchGroupNames(query) {
  return request({
    url: '/qtech/im/groupNames/aa',
    method: 'get',
    params: query
  })
}

export function fetchList(query) {
  return request({
    url: '/aa/params/index/list',
    method: 'get',
    params: query
  })
}

export function fetchAaTtlEqs(query) {
  return request({
    url: '/aa/params/ttl/list',
    method: 'get',
    params: query
  })
}

export function getUpdateTime() {
  return request({
    url: '/aa/params/index/updateTime',
    method: 'get'
  })
}
