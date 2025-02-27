<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="版本号" prop="version">
        <el-input v-model="queryParams.version" placeholder="请输入版本号" clearable style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="发布状态" clearable style="width: 240px">
          <el-option v-for="dict in DICT_RELEASE_STATUS" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['release:release:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['release:release:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['release:release:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="releaseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="发布编号" prop="releaseId" width="100" />
      <el-table-column label="版本号" prop="version" :show-overflow-tooltip="true" />
      <el-table-column label="发布内容" prop="content" :show-overflow-tooltip="true" />
      <el-table-column label="发布时间" align="center" prop="releaseTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.releaseTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="DICT_RELEASE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['release:release:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['release:release:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改发布记录对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="releaseRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="版本号" prop="version">
          <el-input v-model="form.version" placeholder="请输入版本号" />
        </el-form-item>
        <el-form-item label="发布内容" prop="content">
          <el-input v-model="form.content" type="textarea" placeholder="请输入发布内容" />
        </el-form-item>
        <el-form-item label="发布时间" prop="releaseTime">
          <el-date-picker v-model="form.releaseTime" type="datetime" placeholder="选择发布时间" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option v-for="dict in DICT_RELEASE_STATUS" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题记录" prop="issues">
          <el-input v-model="form.issues" type="textarea" placeholder="请输入问题记录" />
        </el-form-item>
        <el-form-item label="影响分析" prop="impact">
          <el-input v-model="form.impact" type="textarea" placeholder="请输入影响分析" />
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

<script setup name="Release">
import { listRelease, getRelease, delRelease, addRelease, updateRelease } from "@/api/release/index";

const { proxy } = getCurrentInstance();
const { DICT_RELEASE_STATUS } = proxy.useDict("DICT_RELEASE_STATUS");

const releaseList = ref([]);
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
    version: undefined,
    status: undefined
  },
  rules: {
    version: [
      { required: true, message: "版本号不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "发布内容不能为空", trigger: "blur" }
    ],
    releaseTime: [
      { required: true, message: "发布时间不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询发布列表 */
function getList() {
  loading.value = true;
  listRelease(queryParams.value).then(response => {
    releaseList.value = response.rows;
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
    releaseId: undefined,
    version: undefined,
    content: undefined,
    releaseTime: undefined,
    status: "0",
    issues: undefined,
    impact: undefined
  };
  proxy.resetForm("releaseRef");
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
  ids.value = selection.map(item => item.releaseId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加发布记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const releaseId = row.releaseId || ids.value;
  getRelease(releaseId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改发布记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["releaseRef"].validate(valid => {
    if (valid) {
      if (form.value.releaseId !== undefined) {
        updateRelease(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRelease(form.value).then(response => {
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
  const releaseIds = row.releaseId || ids.value;
  proxy.$modal.confirm('是否确认删除发布记录编号为"' + releaseIds + '"的数据项？').then(function() {
    return delRelease(releaseIds);
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
