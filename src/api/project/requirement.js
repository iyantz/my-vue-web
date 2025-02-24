import request from '@/utils/request'

// 查询需求列表
export function listRequirement(query) {
  return request({
    url: '/project/requirement/list',
    method: 'get',
    params: query
  })
}

// 查询需求详细
export function getRequirement(requirementId) {
  return request({
    url: '/project/requirement/' + requirementId,
    method: 'get'
  })
}

// 新增需求
export function addRequirement(data) {
  return request({
    url: '/project/requirement',
    method: 'post',
    data: data
  })
}

// 修改需求
export function updateRequirement(data) {
  return request({
    url: '/project/requirement',
    method: 'put',
    data: data
  })
}

// 删除需求
export function delRequirement(requirementId) {
  return request({
    url: '/project/requirement/' + requirementId,
    method: 'delete'
  })
}
