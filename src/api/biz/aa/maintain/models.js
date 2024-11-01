import request from '@/utils/request'

export function deleteAaParamsModelInfo(id) {
  return request({
    url: '/aa/params/model/info/remove/' + id,
    method: 'delete'
  })
}

export function getAaParamsModelInfo(query) {
  return request({
    url: '/aa/params/model/info/list',
    method: 'get',
    params: query
  })
}

export function updateAaParamsModelInfo(data) {
  return request({
    url: '/aa/params/model/info/edit',
    method: 'post',
    data
  })
}

export function updateAaParamsModelInfoStatus(data) {
  return request({
    url: '/aa/params/model/info/edit',
    method: 'post',
    data
  })
}

export function addAaParamsModel(data) {
  return request({
    url: '/aa/params/model/detail/add',
    method: 'post',
    data
  })
}

export function getAaParamsParsed(query) {
  return request({
    url: '/aa/params/parsed/detail/list',
    method: 'get',
    params: query
  })
}

export function getAaParamsStdModels(query) {
  return request({
    url: '/aa/params/model/detail/list',
    method: 'get',
    params: query
  })
}

export function updateAaParamsStdModel(data) {
  return request({
    url: '/aa/params/model/detail/edit',
    method: 'post',
    data
  })
}
