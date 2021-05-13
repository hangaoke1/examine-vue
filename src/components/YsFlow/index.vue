<template>
  <div class="flow-editor">
    <!-- 工具条 -->
    <div class="flow-editor-toolbar">
      <el-button
        :disabled="scale <= 0.5"
        icon="el-icon-minus"
        size="mini"
        @click="scaleClick('minus')"
      />
      <span class="flow-editor-toolbar__scale">{{ (scale * 100).toFixed(0) }}%</span>
      <el-button :disabled="scale > 3" icon="el-icon-plus" size="mini" @click="scaleClick('plus')" />
    </div>

    <!-- 审批流主体 -->
    <div :style="scaleStyle" class="flow-editor-view">
      <flow-branch-node v-if="flowStore" :node="flowStore.rootNode"></flow-branch-node>
    </div>

    <!-- 编辑节点数据 -->
    <edit-panel v-model="showEdit" :node="editNode"></edit-panel>
  </div>
</template>

<script>
import FlowEditorStore from '@/lib/flow'
import FlowBranchNode from './nodes/FlowBranchNode.vue'
import EditPanel from './panel/EditPanel.vue'
import eventbus from './eventbus'

export default {
  name: 'FlowEditor',
  components: {
    FlowBranchNode,
    EditPanel,
  },
  provide() {
    return {
      getFlowStore: () => {
        return this.flowStore
      },
    }
  },
  data() {
    return {
      scale: 1, // 缩放尺寸
      flowStore: null, // 审批流实例
      showEdit: false,
      editNode: null, // 编辑节点
    }
  },
  computed: {
    scaleStyle() {
      return {
        transform: `scale(${this.scale})`,
      }
    },
  },
  mounted() {
    this.flowStore = new FlowEditorStore()
    window.flowStore = this.flowStore

    eventbus.on('node_click', this.handleNodeClick)
  },
  destroyed() {
    eventbus.off('node_click', this.handleNodeClick)
  },
  methods: {
    handleNodeClick(node) {
      this.editNode = node
      this.showEdit = true
    },
    scaleClick(type) {
      if (type === 'minus') {
        this.scale = this.scale - 0.1
      } else if (type === 'plus') {
        this.scale = this.scale + 0.1
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
