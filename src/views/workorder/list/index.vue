<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入工单标题" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="工单状态" clearable style="width: 240px">
          <el-option v-for="dict in DICT_WORKORDER_STATUS" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="queryParams.priority" placeholder="优先级" clearable style="width: 240px">
          <el-option v-for="dict in DICT_WORKORDER_PRIORITY" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['workorder:workorder:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['workorder:workorder:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['workorder:workorder:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="workorderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="工单编号" prop="workorderId" width="100" />
      <el-table-column label="标题" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="问题描述" prop="description" :show-overflow-tooltip="true" />
      <el-table-column label="影响评估" prop="impact" :show-overflow-tooltip="true" />
      <el-table-column label="优先级" align="center" prop="priority" width="100">
        <template #default="scope">
          <dict-tag :options="DICT_WORKORDER_PRIORITY" :value="scope.row.priority" />
        </template>
      </el-table-column>
      <el-table-column label="处理人" prop="assignee" width="100" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="DICT_WORKORDER_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['workorder:workorder:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['workorder:workorder:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改工单对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="workorderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入工单标题" />
        </el-form-item>
        <el-form-item label="问题描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入问题描述" />
        </el-form-item>
        <el-form-item label="影响评估" prop="impact">
          <el-input v-model="form.impact" type="textarea" placeholder="请输入影响评估" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择优先级">
            <el-option v-for="dict in DICT_WORKORDER_PRIORITY" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理人" prop="assignee">
          <el-select v-model="form.assignee" placeholder="请选择处理人">
            <el-option v-for="user in userOptions" :key="user.userId" :label="user.userName" :value="user.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option v-for="dict in DICT_WORKORDER_STATUS" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理记录" prop="processLog" v-if="form.workorderId">
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in form.processLog"
              :key="index"
              :timestamp="log.createTime">
              {{ log.content }}
            </el-timeline-item>
          </el-timeline>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Workorder">
import { listWorkOrder, getWorkOrder, delWorkOrder, addWorkOrder, updateWorkOrder } from "@/api/workorder/index";
import { listUser } from "@/api/system/user";

const { proxy } = getCurrentInstance();
const { DICT_WORKORDER_STATUS, DICT_WORKORDER_PRIORITY } = proxy.useDict("DICT_WORKORDER_STATUS", "DICT_WORKORDER_PRIORITY");

const workorderList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const userOptions = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    status: undefined,
    priority: undefined
  },
  rules: {
    title: [
      { required: true, message: "工单标题不能为空", trigger: "blur" }
    ],
    description: [
      { required: true, message: "问题描述不能为空", trigger: "blur" }
    ],
    priority: [
      { required: true, message: "优先级不能为空", trigger: "change" }
    ],
    assignee: [
      { required: true, message: "处理人不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询工单列表 */
function getList() {
  loading.value = true;
  listWorkOrder(queryParams.value).then(response => {
    workorderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 获取用户列表 */
function getUserOptions() {
  listUser().then(response => {
    userOptions.value = response.rows;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    workorderId: undefined,
    title: undefined,
    description: undefined,
    impact: undefined,
    priority: undefined,
    assignee: undefined,
    status: "0",
    processLog: []
  };
  proxy.resetForm("workorderRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.workorderId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  getUserOptions();
  open.value = true;
  title.value = "添加工单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  getUserOptions();
  const workorderId = row.workorderId || ids.value;
  getWorkOrder(workorderId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改工单";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["workorderRef"].validate(valid => {
    if (valid) {
      if (form.value.workorderId !== undefined) {
        updateWorkOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addWorkOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const workorderIds = row.workorderId || ids.value;
  proxy.$modal.confirm('是否确认删除工单编号为"' + workorderIds + '"的数据项？').then(function() {
    return delWorkOrder(workorderIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}
</style>
