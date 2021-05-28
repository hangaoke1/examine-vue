<template>
  <div class="flow-editor-node">
    <div :style="{ background: bgColor }" class="flow-editor-node-container" @click="nodeClick">
      <!-- 节点标题 -->
      <div :style="{ color: titleColor }" class="node-title">
        <span>{{ title }}</span>
      </div>

      <!-- 节点内容 -->
      <div class="node-content">
        <div v-if="content" class="node-content__inner">{{ content }}</div>
        <div v-else class="node-content__inner node-content__placeholder">{{ placeholder }}</div>
      </div>

      <!-- 默认插槽 -->
      <slot></slot>

      <!-- 节点删除 -->
      <i v-if="closeable" class="close-btn el-icon-close" @click.stop="deleteClick" />
      <div v-if="showDeleteModal" class="close-modal">
        <el-button size="mini" @click.stop="deleteCancel">取消</el-button>
        <el-button size="mini" type="danger" @click.stop="deleteConfirm">删除</el-button>
      </div>

      <!-- 错误提示 -->
      <i v-if="node.isError" class="el-icon-warning"></i>
    </div>

    <template v-if="node.type !== 'END'">
      <div class="v-line"></div>
      <add-node-btn @add="handleAdd"></add-node-btn>
    </template>
  </div>
</template>

<script>
import AddNodeBtn from './AddNodeBtn.vue';
import eventbus from '../eventbus';

/**
 * events
 * @add 添加节点
 * @delete 删除节点
 */
export default {
  name: 'FlowEditorNode',
  components: {
    AddNodeBtn,
  },
  props: {
    node: Object, // 节点数据
    title: String, // 节点标题
    content: String, // 节点展示内容
    placeholder: {
      type: String,
      default: '请配置节点内容',
    }, // 节点默认展示内容
    closeable: {
      // 节点是否可删除
      type: Boolean,
      default: true,
    },
    bgColor: {
      // 节点颜色
      type: String,
      default: '#1890ff',
    },
    titleColor: {
      // 标题颜色
      type: String,
      default: '#fff',
    },
  },
  data() {
    return {
      showDeleteModal: false,
    };
  },
  methods: {
    nodeClick() {
      if (this.node) {
        eventbus.emit('node_click', this.node);
      }
    },
    handleAdd(type) {
      this.$emit('add', type);
    },
    deleteClick() {
      this.showDeleteModal = true;
    },
    deleteConfirm() {
      this.$emit('delete');
      this.showDeleteModal = false;
    },
    deleteCancel() {
      this.showDeleteModal = false;
    },
  },
};
</script>
