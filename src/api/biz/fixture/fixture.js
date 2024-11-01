import request from '@/utils/request'

// 查询治具列表
export function listFixture(query) {
  return request({
    url: '/fixture/search/list',
    method: 'get',
    params: query
  })
}

// 新增治具共用信息
export function addFixtureSharedInfo(data) {
  return request({
    url: '/fixture/search',
    method: 'post',
    data: data
  })
}

// 查询治具详细
export function getFixtureParamsPogopin(id) {
  return request({
    url: '/fixture/params/pogopin/' + id,
    method: 'get'
  })
}

// 新增治具
export function addFixtureParamsPogopin(data) {
  return request({
    url: '/fixture/params/pogopin',
    method: 'post',
    data: data
  })
}

// 修改治具
export function updateFixtureParamsPogopin(data) {
  return request({
    url: '/fixture/params/pogopin',
    method: 'put',
    data: data
  })
}

// 删除治具因子
export function delFixtureParamsPogopin(data) {
  return request({
    url: '/fixture/params/pogopin',
    method: 'delete',
    data: data
  })
}

// AA
export function getFixtureParamsAa(id) {
  return request({
    url: '/fixture/params/aa/' + id,
    method: 'get'
  })
}

export function addFixtureParamsAa(data) {
  return request({
    url: '/fixture/params/aa',
    method: 'post',
    data: data
  })
}

export function updateFixtureParamsAa(data) {
  return request({
    url: '/fixture/params/aa',
    method: 'put',
    data: data
  })
}

export function delFixtureParamsAa(data) {
  return request({
    url: '/fixture/params/aa',
    method: 'delete',
    data: data
  })
}

// Lock
export function listFixtureParamsLock(query) {
  return request({
    url: '/fixture/params/lock/list',
    method: 'get',
    params: query
  })
}

export function getFixtureParamsLock(id) {
  return request({
    url: '/fixture/params/lock/' + id,
    method: 'get'
  })
}

export function addFixtureParamsLock(data) {
  return request({
    url: '/fixture/params/lock',
    method: 'post',
    data: data
  })
}

export function updateFixtureParamsLock(data) {
  return request({
    url: '/fixture/params/lock',
    method: 'put',
    data: data
  })
}

export function delFixtureParamsLock(data) {
  return request({
    url: '/fixture/params/lock',
    method: 'delete',
    data: data
  })
}


// 根据id获取治具共享信息
export function getFixtureSharedInfo(id) {
  return request({
    url: '/fixture/search/' + id,
    method: 'get'
  })
}

// 修改治具共享信息
export function updateFixtureSharedInfo(data) {
  return request({
    url: '/fixture/search',
    method: 'put',
    data: data
  })
}
// 删除治具共用信息
export function delFixtureSharedInfo(data) {
  return request({
    url: '/fixture/search',
    method: 'delete',
    data: data
  })
}

// 远程获取治具类型
export function fixtureCategoryList(query) {
  return request({
    url: '/fixture/category/list',
    method: 'get',
    params: query
  })
}

export function fixtureCategoryAll(query) {
  return request({
    url: '/fixture/category/all',
    method: 'get',
    params: query
  })
}

// 新增治具类型
export function addFixtureCategory(data) {
  return request({
    url: '/fixture/category',
    method: 'post',
    data: data
  })
}

// 修改治具类型
export function updateFixtureCategory(data) {
  return request({
    url: '/fixture/category',
    method: 'put',
    data: data
  })
}

// 删除治具类型
export function deleteFixtureCategory(id) {
  return request({
    url: '/fixture/category/' + id,
    method: 'delete'
  })
}

// 查询权限拥有的类别
export function getDeptIds() {
  return request({
    url: '/fixture/search/deptIds',
    method: 'get'
  })
}

// 查询所有料号
export function getFixturematerialNmbs(deptId) {
  return request({
    url: '/fixture/materialInfo/' + deptId,
    method: 'get'
  })
}

// 查询料号是否存在
export function materialNmbRules(query) {
  return request({
    url: '/fixture/materialInfo/exist',
    method: 'get',
    params: query
  })
}

// 获取环形图数据
export function getFixturePanelData() {
  return request({
    url: '/fixture/statistics/panel',
    method: 'get'
  })
}

// 获取线性趋势图数据
export function getFixtureTrendingLineData() {
  return request({
    url: '/fixture/statistics/line',
    method: 'get'
  })
}

// 获取pogopin因子
export function listFixtureParamsPogopin(query) {
  return request({
    url: '/fixture/params/pogopin/list',
    method: 'get',
    params: query
  })
}

// 获取AA因子
export function listFixtureParamsAa(query) {
  return request({
    url: '/fixture/params/aa/list',
    method: 'get',
    params: query
  })
}


