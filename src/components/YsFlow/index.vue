<template>
  <div class="flow-editor">
    <!-- 工具条 -->
    <div class="flow-editor-toolbar">
      <el-button type="text" @click="previewXML">查看XML</el-button>
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

    <el-dialog v-model="showXml" title="流程XML" width="1050px" append-to-body>
      <monaco-editor
        :value="xmlContent"
        :options="{
          fontSize: 14
        }"
        width="1000"
        height="500"
        theme="vs-dark"
        language="xml"
      ></monaco-editor>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showXml = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import MonacoEditor from '@/components/MancoEditor/index.vue'
import FlowBranchNode from './nodes/FlowBranchNode.vue'
import EditPanel from './panel/EditPanel.vue'

import FlowEditorStore from '@/lib/flow'
import eventbus from './eventbus'

export default {
  name: 'FlowEditor',
  components: {
    MonacoEditor,
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
      showXml: false,
      xmlContent: '',
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
  umounted() {
    eventbus.off('node_click', this.handleNodeClick)
  },
  methods: {
    previewXML() {
      this.xmlContent = this.flowStore.buildXML()
      this.showXml = true
    },
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
