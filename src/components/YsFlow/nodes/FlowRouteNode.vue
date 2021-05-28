<template>
  <div class="flow-route-node">
    <div class="top-h-line"></div>
    <div class="add-branch-btn" @click="addBranchClick">添加条件</div>
    <div class="branchs">
      <flow-branch-node
        v-for="(item, index) in node.data.children"
        :key="item.id"
        :node="item"
        :route-node="node"
        :branch-index="index"
        :branch-count="node.data.children.length"
      ></flow-branch-node>
    </div>
    <div class="bottom-h-line"></div>
    <div class="v-line"></div>
    <add-node-btn @add="handleAdd"></add-node-btn>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import AddNodeBtn from '../components/AddNodeBtn.vue';

const FlowBranchNode = defineAsyncComponent(() => import('./FlowBranchNode.vue'));

export default {
  name: 'FlowRouteNode',
  emits: ['add', 'addBranch'],
  components: {
    AddNodeBtn,
    FlowBranchNode,
  },
  props: {
    node: Object,
  },
  methods: {
    handleAdd(type) {
      this.$emit('add', type);
    },
    addBranchClick() {
      this.$emit('addBranch');
    },
  },
};
</script>
