import request from '@/utils/request'

// 查询车间级金线用量监控列表
export function listWorkshop(query) {
  return request({
    url: '/biz/wire/monitor/group/list',
    method: 'get',
    params: query
  })
}