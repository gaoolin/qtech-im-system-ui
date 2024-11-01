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

// 查询厂区
export function getFactoryNames() {
  return request({
    url: '/wb/olp/index/factoryNames',
    method: 'get'
  })
}

// 查询车间
export function getGroupNames(query) {
  return request({
    url: '/wb/olp/index/workShopNames',
    method: 'get',
    params: query
  })
}


