<template>
  <div class="flow-branch-node">
    <div class="top-line-mask"></div>
    <div class="top-v-line"></div>
    <div class="nodes">
      <template v-for="childNode in node.data.children">
        <!-- 路由节点 -->
        <flow-route-node
          v-if="childNode.type === 'ROUTE'"
          :key="childNode.id"
          :node="childNode"
          :class="childNode.type"
          @add="handleAdd(childNode, $event)"
          @addBranch="handleAddBranch(childNode)"
        ></flow-route-node>

        <flow-edit-node
          v-else
          :key="childNode.id"
          :node="childNode"
          :class="childNode.type"
          :title="childNode.data.name"
          :bg-color="backgroundMap[childNode.type]"
          :closeable="!['START', 'END'].includes(childNode.type) && !childNode.data.isDefault"
          @add="handleAdd(childNode, $event)"
          @delete="handleDelete(childNode)"
        ></flow-edit-node>
      </template>
    </div>
    <div class="bottom-v-line"></div>
    <div class="bottom-line-mask"></div>
  </div>
</template>

<script>
import FlowEditNode from '../components/FlowEditNode.vue'
import FlowRouteNode from './FlowRouteNode.vue'
export default {
  name: 'FlowBranchNode',
  components: {
    FlowEditNode,
    FlowRouteNode
  },
  inject: ['getFlowStore'],
  props: {
    node: Object,
    routeNode: Object,
  },
  data() {
    return {
      backgroundMap: {
        START: '#a9b4cd',
        END: '#a9b4cd',
        CONDITION: '#52c41a',
        APPROVAL: '#faad14',
        ACTION: '#722ed1'
      }
    }
  },
  computed: {
    flowStore() {
      return this.getFlowStore()
    },
  },
  methods: {
    handleAddBranch(node) {
      this.flowStore.addBranch(node.id)
    },
    handleAdd(node, type) {
      this.flowStore.addNext(node.id, type)
    },
    handleDelete(node) {
      this.flowStore.deleteNode(node.id)
    },
  },
}
</script>
