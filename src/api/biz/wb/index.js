import request from '@/utils/request'

export function getWbOlpIndexOverview(query) {
  return request({
    url: '/wb/olp/index/overview',
    method: 'get',
    params: query
  })
}

export function getWbOlpIndexTrending(query) {
  return request({
    url: '/wb/olp/index/trending',
    method: 'get',
    params: query
    })
}

