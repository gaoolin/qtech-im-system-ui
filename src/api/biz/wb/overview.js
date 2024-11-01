import request from '@/utils/request'

// 查询智慧打线图列表
export function listOverview(query) {
  return request({
    url: '/wb/olp/statistics/overView',
    method: 'get',
    params: query
  })
}

// 获取数据更新时间
export function getUpdateTime() {
  return request({
    url: '/wb/olp/statistics/updateTime',
    method: 'get'
  })
}
