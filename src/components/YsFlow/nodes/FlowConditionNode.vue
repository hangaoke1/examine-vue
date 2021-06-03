<template>
  <flow-edit-node v-on="$attrs">
    <i v-if="showLeftMove" class="el-icon-caret-left arrow-left" @click.stop="moveToleft"></i>
    <i v-if="showRightMove" class="el-icon-caret-right arrow-right" @click.stop="moveToRight"></i>
  </flow-edit-node>
</template>

<script>
import FlowEditNode from '../components/FlowEditNode.vue';
export default {
  name: 'FlowConditionNode',
  components: {
    FlowEditNode,
  },
  inject: ['getFlowStore'],
  props: {
    branchIndex: Number,
    branchCount: Number,
  },
  computed: {
    flowStore() {
      return this.getFlowStore();
    },
    showLeftMove() {
      if (this.branchIndex === this.branchCount - 1) {
        return false;
      }

      if (this.branchIndex > 0) {
        return true;
      }
      return false;
    },
    showRightMove() {
      if (this.branchIndex === this.branchCount - 1) {
        return false;
      }

      if (this.branchIndex < this.branchCount - 2) {
        return true;
      }

      return false;
    },
  },
  methods: {
    moveToleft() {
      this.flowStore.moveCondition(this.$attrs.node.id, this.branchIndex - 1);
    },
    moveToRight() {
      this.flowStore.moveCondition(this.$attrs.node.id, this.branchIndex + 1);
    },
  },
};
</script>
