import request from '@/utils/request'

// 查询金线标准用量信息列表
export function listQuery(query) {
  return request({
    url: '/biz/wire/standard/list',
    method: 'get',
    params: query
  })
}

// 查询金线标准用量信息详细
export function getQuery(prodType) {
  return request({
    url: '/biz/wire/standard/' + prodType,
    method: 'get'
  })
}

// 新增金线标准用量信息
export function addQuery(data) {
  return request({
    url: '/biz/wire/standard',
    method: 'post',
    data: data
  })
}

// 修改金线标准用量信息
export function updateQuery(data) {
  return request({
    url: '/biz/wire/standard',
    method: 'put',
    data: data
  })
}

// 删除金线标准用量信息
export function delQuery(prodType) {
  return request({
    url: '/biz/wire/standard/' + prodType,
    method: 'delete'
  })
}