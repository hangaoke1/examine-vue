<template>
  <div class="u-title" @click="showEdit">
    <el-input
      v-if="titleEdit"
      :modelValue="modelValue"
      @update:modelValue="handleUpdate"
      @blur="hideEdit"
    ></el-input>
    <span v-else>{{ modelValue }}</span>
  </div>
</template>

<script>
export default {
  name: 'TitleInput',
  emits: ['update:modelValue'],
  props: {
    modelValue: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      titleEdit: false,
    };
  },
  methods: {
    showEdit() {
      if (this.disabled) return;
      this.titleEdit = true;
    },
    hideEdit() {
      this.titleEdit = false;
    },
    handleUpdate(value) {
      this.$emit('update:modelValue', value);
    },
  },
};
</script>

<style lang="less" scoped>
.u-title {
  flex: 0 0 auto;
  padding: 20px;
  font-size: 20px;
  font-weight: 500;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
</style>
