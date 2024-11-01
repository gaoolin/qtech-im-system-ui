import request from '@/utils/request'



export function uploadAaParamsModel(data) {
  return request({
    url: '/aa/params/model/upload/online',
    method: 'post',
    data
  })
}

export function fetchFactoryName() {
  return request({
    url: '/aa/params/common/factoryName',
    method: 'get'
  })
}

export function fetchWorkshopName(query) {
  return request({
    url: '/aa/params/common/workshopName',
    method: 'get',
    params: query
  })
}


export function listAaEquipmentInfo(query) {
  return request({
    url: '/aa/params/eq/list',
    method: 'get',
    params: query
  })
}

export function updateAaEqReverseStat(data) {
  return request({
    url: '/aa/params/eq/ignore',
    method: 'post',
    data
  })
}
