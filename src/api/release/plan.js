import request from '@/utils/request'

// 查询发布计划列表
export function listReleasePlan(query) {
  return request({
    url: '/release/plan/list',
    method: 'get',
    params: query
  })
}

// 查询发布计划详细
export function getReleasePlan(planId) {
  return request({
    url: '/release/plan/' + planId,
    method: 'get'
  })
}

// 新增发布计划
export function addReleasePlan(data) {
  return request({
    url: '/release/plan',
    method: 'post',
    data: data
  })
}

// 修改发布计划
export function updateReleasePlan(data) {
  return request({
    url: '/release/plan',
    method: 'put',
    data: data
  })
}

// 删除发布计划
export function delReleasePlan(planId) {
  return request({
    url: '/release/plan/' + planId,
    method: 'delete'
  })
}
