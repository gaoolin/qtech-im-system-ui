import request from '@/utils/request'

export function listHistory(query) {
  return request({
    url: '/fixture/history/list',
    method: 'get',
    params: query
  })
}

export function getHistory(id) {
  return request({
    url: '/fixture/history' + id,
    method: 'get'
  })
}

export function addHistory(data) {
  return request({
    url: '/fixture/history',
    method: 'post',
    data: data
  })
}

export function updateHistory(data) {
  return request({
    url: '/fixture/history',
    method: 'put',
    data: data
  })
}

export function delHistory(id) {
  return request({
    url: '/fixture/history' + id,
    method: 'delete'
  })
}
