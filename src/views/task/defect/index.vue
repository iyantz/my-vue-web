<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="缺陷标题" prop="defectName">
        <el-input v-model="queryParams.defectName" placeholder="请输入缺陷标题" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="queryParams.priority" placeholder="缺陷优先级" clearable style="width: 240px">
          <el-option v-for="dict in DICT_DEFECT_PRIORITY" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="缺陷状态" clearable style="width: 240px">
          <el-option v-for="dict in DICT_DEFECT_STATUS" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['task:defect:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['task:defect:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['task:defect:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="defectList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="缺陷编号" prop="defectId" width="100" />
      <el-table-column label="缺陷标题" prop="defectName" :show-overflow-tooltip="true" />
      <el-table-column label="所属项目" prop="projectName" width="120" />
      <el-table-column label="所属任务" prop="taskName" width="120" />
      <el-table-column label="优先级" align="center" width="100">
        <template #default="scope">
          <dict-tag :options="DICT_DEFECT_PRIORITY" :value="scope.row.priority" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <dict-tag :options="DICT_DEFECT_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['task:defect:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['task:defect:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改缺陷对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="defectRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="缺陷标题" prop="defectName">
          <el-input v-model="form.defectName" placeholder="请输入缺陷标题" />
        </el-form-item>
        <el-form-item label="缺陷描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入缺陷描述" />
        </el-form-item>
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="form.projectId" placeholder="请选择项目" @change="handleProjectChange">
            <el-option v-for="item in projectOptions" :key="item.projectId" :label="item.projectName" :value="item.projectId" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属任务" prop="taskId">
          <el-select v-model="form.taskId" placeholder="请选择任务">
            <el-option v-for="item in taskOptions" :key="item.taskId" :label="item.taskName" :value="item.taskId" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择优先级">
            <el-option v-for="dict in DICT_DEFECT_PRIORITY" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option v-for="dict in DICT_DEFECT_STATUS" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
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

<script setup name="Defect">
import { listDefect, getDefect, delDefect, addDefect, updateDefect } from "@/api/task/defect";
import { listProject } from "@/api/project/index";
import { listTask } from "@/api/task/index";

const { proxy } = getCurrentInstance();
const { DICT_DEFECT_PRIORITY, DICT_DEFECT_STATUS } = proxy.useDict("DICT_DEFECT_PRIORITY", "DICT_DEFECT_STATUS");

const defectList = ref([]);
const projectOptions = ref([]);
const taskOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    defectName: undefined,
    priority: undefined,
    status: undefined
  },
  rules: {
    defectName: [
      { required: true, message: "缺陷标题不能为空", trigger: "blur" }
    ],
    projectId: [
      { required: true, message: "所属项目不能为空", trigger: "change" }
    ],
    taskId: [
      { required: true, message: "所属任务不能为空", trigger: "change" }
    ],
    priority: [
      { required: true, message: "优先级不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询项目列表 */
function getProjectList() {
  listProject().then(response => {
    projectOptions.value = response.rows;
  });
}

/** 根据项目ID查询任务列表 */
function getTaskList(projectId) {
  listTask({ projectId: projectId }).then(response => {
    taskOptions.value = response.rows;
  });
}

/** 项目选择框变化事件 */
function handleProjectChange(projectId) {
  form.value.taskId = undefined;
  if (projectId) {
    getTaskList(projectId);
  } else {
    taskOptions.value = [];
  }
}

/** 查询缺陷列表 */
function getList() {
  loading.value = true;
  listDefect(queryParams.value).then(response => {
    defectList.value = response.rows;
    total.value = response.total;
    loading.value = false;
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
    defectId: undefined,
    defectName: undefined,
    description: undefined,
    projectId: undefined,
    taskId: undefined,
    priority: undefined,
    status: undefined
  };
  proxy.resetForm("defectRef");
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
  ids.value = selection.map(item => item.defectId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  getProjectList();
  open.value = true;
  title.value = "添加缺陷";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  getProjectList();
  const defectId = row.defectId || ids.value;
  getDefect(defectId).then(response => {
    form.value = response.data;
    if (form.value.projectId) {
      getTaskList(form.value.projectId);
    }
    open.value = true;
    title.value = "修改缺陷";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["defectRef"].validate(valid => {
    if (valid) {
      if (form.value.defectId !== undefined) {
        updateDefect(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDefect(form.value).then(response => {
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
  const defectIds = row.defectId || ids.value;
  proxy.$modal.confirm('是否确认删除缺陷编号为"' + defectIds + '"的数据项？').then(function() {
    return delDefect(defectIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>
