import request from '@/utils/request'

// 查询厂区级金线用量监控列表
export function listFactory(query) {
  return request({
    url: '/biz/wire/monitor/factory/list',
    method: 'get',
    params: query
  })
}