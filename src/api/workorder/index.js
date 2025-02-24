import request from '@/utils/request'

// 查询工单列表
export function listWorkOrder(query) {
  return request({
    url: '/workorder/workorder/list',
    method: 'get',
    params: query
  })
}

// 查询工单详细
export function getWorkOrder(workorderId) {
  return request({
    url: '/workorder/workorder/' + workorderId,
    method: 'get'
  })
}

// 新增工单
export function addWorkOrder(data) {
  return request({
    url: '/workorder/workorder',
    method: 'post',
    data: data
  })
}

// 修改工单
export function updateWorkOrder(data) {
  return request({
    url: '/workorder/workorder',
    method: 'put',
    data: data
  })
}

// 删除工单
export function delWorkOrder(workorderId) {
  return request({
    url: '/workorder/workorder/' + workorderId,
    method: 'delete'
  })
}
