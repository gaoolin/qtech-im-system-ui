import request from "@/utils/request"

// 打线图数采列表
export function listUpload(query) {
  return request({
    url: '/wb/olp/upload/list',
    method: 'get',
    params: query
  })
}

// 向服务器提交标准模版
export function addOnline(query) {
  return request({
    url: '/wb/olp/upload/online',
    method: 'get',
    params: query
  })
}
