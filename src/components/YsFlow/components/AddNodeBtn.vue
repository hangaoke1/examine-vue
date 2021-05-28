<template>
  <div class="add-node-btn">
    <el-popover
      v-model:visible="popoverShow"
      :show-arrow="false"
      :hide-after="0"
      transition="false"
      placement="right-start"
      popper-class="add-node-popover"
      trigger="click"
    >
      <div class="add-node-group">
        <div class="add-node-item" @click="addClick('APPROVAL')">审批人</div>
        <div class="add-node-item" @click="addClick('ROUTE')">条件分支</div>
        <div class="add-node-item" @click="addClick('ACTION')">任务动作</div>
      </div>
      <template #reference>
        <div class="add-node-reference">
          <span class="el-icon-plus"></span>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'AddNodeBtn',
  emits: ['add'],
  data() {
    return {
      popoverShow: false,
    };
  },
  methods: {
    addClick(nodeType) {
      this.popoverShow = false;
      this.$emit('add', nodeType);
    },
  },
};
</script>
