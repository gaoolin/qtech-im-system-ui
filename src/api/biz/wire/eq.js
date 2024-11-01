import request from '@/utils/request'

// 查询金线消耗量列表
export function listEq(query) {
  return request({
    url: '/biz/wire/monitor/eq/list',
    method: 'get',
    params: query
  })
}

// 查询金线消耗量详细
export function getEq(factoryName) {
  return request({
    url: '/biz/wire/monitor/eq/' + factoryName,
    method: 'get'
  })
}

// 新增金线消耗量
export function addEq(data) {
  return request({
    url: '/biz/wire/monitor/eq',
    method: 'post',
    data: data
  })
}

// 修改金线消耗量
export function updateEq(data) {
  return request({
    url: '/biz/wire/monitor/eq',
    method: 'put',
    data: data
  })
}

// 删除金线消耗量
export function delEq(factoryName) {
  return request({
    url: '/biz/wire/monitor/eq/' + factoryName,
    method: 'delete'
  })
}
