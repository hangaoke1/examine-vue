<template>
  <el-drawer v-bind="$attrs" :with-header="false">
    <div v-if="editNode" class="edit-panel">
      <title-input class="edit-panel-title" v-model="editNode.data.name"></title-input>
      <div class="edit-panel-content">自定义需要编辑的节点数据</div>
      <div class="edit-panel-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import _ from 'lodash';
import TitleInput from '../components/TitleInput.vue';
export default {
  name: 'EditPanel',
  components: {
    TitleInput,
  },
  inject: ['getFlowStore'],
  props: {
    node: Object,
  },
  data() {
    return {
      editNode: null,
    };
  },
  computed: {
    flowStore() {
      return this.getFlowStore();
    },
  },
  watch: {
    '$attrs.modelValue'(val) {
      if (val) {
        this.editNode = _.cloneDeep(this.node);
      }
    },
  },
  methods: {
    handleCancel() {
      this.$emit('update:modelValue', false);
    },
    handleConfirm() {
      this.flowStore.updateNodeData(this.node.id, this.editNode.data);
      this.$emit('update:modelValue', false);
    },
  },
};
</script>

<style lang="less" scoped>
.edit-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  &-title {
    flex: 0 0 auto;
    border-bottom: 1px solid #eee;
  }
  &-content {
    flex: 1;
    padding: 20px;
  }
  &-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex: 0 0 auto;
    padding: 20px;
    border-top: 1px solid #eee;
  }
}
</style>
