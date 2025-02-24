import request from '@/utils/request'

// 查询发布列表
export function listRelease(query) {
  return request({
    url: '/release/release/list',
    method: 'get',
    params: query
  })
}

// 查询发布详细
export function getRelease(releaseId) {
  return request({
    url: '/release/release/' + releaseId,
    method: 'get'
  })
}

// 新增发布
export function addRelease(data) {
  return request({
    url: '/release/release',
    method: 'post',
    data: data
  })
}

// 修改发布
export function updateRelease(data) {
  return request({
    url: '/release/release',
    method: 'put',
    data: data
  })
}

// 删除发布
export function delRelease(releaseId) {
  return request({
    url: '/release/release/' + releaseId,
    method: 'delete'
  })
}
