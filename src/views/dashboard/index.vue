<template>
  <div class="dashboard-container">
    <div class="dashboard-text">欢迎使用项目开发管理系统</div>
    
    <el-row :gutter="20" class="mt20">
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>项目统计</span>
            </div>
          </template>
          <div class="card-body">
            <div class="data-item">
              <div class="data-title">总项目数</div>
              <div class="data-value">{{ statistics.totalProjects }}</div>
            </div>
            <div class="data-item">
              <div class="data-title">进行中</div>
              <div class="data-value success">{{ statistics.inProgressProjects }}</div>
            </div>
            <div class="data-item">
              <div class="data-title">已完成</div>
              <div class="data-value info">{{ statistics.completedProjects }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>任务统计</span>
            </div>
          </template>
          <div class="card-body">
            <div class="data-item">
              <div class="data-title">总任务数</div>
              <div class="data-value">{{ statistics.totalTasks }}</div>
            </div>
            <div class="data-item">
              <div class="data-title">进行中</div>
              <div class="data-value warning">{{ statistics.inProgressTasks }}</div>
            </div>
            <div class="data-item">
              <div class="data-title">已完成</div>
              <div class="data-value success">{{ statistics.completedTasks }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>工单统计</span>
            </div>
          </template>
          <div class="card-body">
            <div class="data-item">
              <div class="data-title">总工单数</div>
              <div class="data-value">{{ statistics.totalWorkOrders }}</div>
            </div>
            <div class="data-item">
              <div class="data-title">待处理</div>
              <div class="data-value warning">{{ statistics.pendingWorkOrders }}</div>
            </div>
            <div class="data-item">
              <div class="data-title">已处理</div>
              <div class="data-value success">{{ statistics.processedWorkOrders }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>发布统计</span>
            </div>
          </template>
          <div class="card-body">
            <div class="data-item">
              <div class="data-title">总发布数</div>
              <div class="data-value">{{ statistics.totalReleases }}</div>
            </div>
            <div class="data-item">
              <div class="data-title">待发布</div>
              <div class="data-value warning">{{ statistics.pendingReleases }}</div>
            </div>
            <div class="data-item">
              <div class="data-title">已发布</div>
              <div class="data-value success">{{ statistics.completedReleases }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt20">
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>最近任务</span>
            </div>
          </template>
          <el-table :data="recentTasks" style="width: 100%">
            <el-table-column prop="taskName" label="任务名称" />
            <el-table-column prop="projectName" label="所属项目" width="120" />
            <el-table-column prop="taskStatus" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.taskStatus)">
                  {{ scope.row.taskStatus === '1' ? '进行中' : scope.row.taskStatus === '2' ? '已完成' : '未开始' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="assignTo" label="负责人" width="100" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>最近工单</span>
            </div>
          </template>
          <el-table :data="recentWorkOrders" style="width: 100%">
            <el-table-column prop="orderTitle" label="工单标题" />
            <el-table-column prop="projectName" label="所属项目" width="120" />
            <el-table-column prop="orderStatus" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.orderStatus)">
                  {{ scope.row.orderStatus === '1' ? '处理中' : scope.row.orderStatus === '2' ? '已完成' : '待处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="handleBy" label="处理人" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listTask } from '@/api/task'
import { listWorkOrder } from '@/api/workorder'
import { listProject } from '@/api/project'
import { listRelease } from '@/api/release'

const statistics = ref({
  totalProjects: 0,
  inProgressProjects: 0,
  completedProjects: 0,
  totalTasks: 0,
  inProgressTasks: 0,
  completedTasks: 0,
  totalWorkOrders: 0,
  pendingWorkOrders: 0,
  processedWorkOrders: 0,
  totalReleases: 0,
  pendingReleases: 0,
  completedReleases: 0
})

const recentTasks = ref([])
const recentWorkOrders = ref([])

/** 获取统计数据 */
function getStatistics() {
  // 项目统计
  listProject().then(response => {
    statistics.value.totalProjects = response.total
    statistics.value.inProgressProjects = response.rows.filter(item => item.status === '1').length
    statistics.value.completedProjects = response.rows.filter(item => item.status === '2').length
  })

  // 任务统计
  listTask().then(response => {
    statistics.value.totalTasks = response.total
    statistics.value.inProgressTasks = response.rows.filter(item => item.taskStatus === '1').length
    statistics.value.completedTasks = response.rows.filter(item => item.taskStatus === '2').length
  })

  // 工单统计
  listWorkOrder().then(response => {
    statistics.value.totalWorkOrders = response.total
    statistics.value.pendingWorkOrders = response.rows.filter(item => item.orderStatus === '0').length
    statistics.value.processedWorkOrders = response.rows.filter(item => item.orderStatus === '2').length
  })

  // 发布统计
  listRelease().then(response => {
    statistics.value.totalReleases = response.total
    statistics.value.pendingReleases = response.rows.filter(item => item.releaseStatus === '0').length
    statistics.value.completedReleases = response.rows.filter(item => item.releaseStatus === '2').length
  })
}

/** 获取最近任务 */
function getRecentTasks() {
  listTask().then(response => {
    recentTasks.value = response.rows.slice(0, 5)
  })
}

/** 获取最近工单 */
function getRecentWorkOrders() {
  listWorkOrder().then(response => {
    recentWorkOrders.value = response.rows.slice(0, 5)
  })
}

/** 获取状态样式 */
function getStatusType(status) {
  if (status === '1') return 'warning'
  if (status === '2') return 'success'
  return 'info'
}

onMounted(() => {
  getStatistics()
  getRecentTasks()
  getRecentWorkOrders()
})
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    padding: 20px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
    margin-bottom: 20px;
  }
}

.mt20 {
  margin-top: 20px;
}

.box-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-body {
    .data-item {
      margin-bottom: 15px;
      .data-title {
        font-size: 14px;
        color: #606266;
        margin-bottom: 5px;
      }
      .data-value {
        font-size: 24px;
        font-weight: bold;
        &.success {
          color: #67C23A;
        }
        &.warning {
          color: #E6A23C;
        }
        &.info {
          color: #909399;
        }
      }
    }
  }
}
</style>
