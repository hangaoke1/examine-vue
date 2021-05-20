### 审批流编辑器

[演示地址](https://hangaoke1.github.io/examine-vue/)
### 目录结构
```
├── components
│   ├── MancoEditor // 代码编辑器
│   │   └── index.vue
│   └── YsFlow
│       ├── components
│       │   ├── AddNodeBtn.vue // 节点添加按钮
│       │   ├── FlowEditNode.vue // 节点公共组件
│       │   └── TitleInput.vue // 标题编辑
│       ├── eventbus.js // 事件总线
│       ├── index.less // 样式文件
│       ├── index.vue // 编辑器入口组件
│       ├── nodes // 节点
│       │   ├── FlowBranchNode.vue // 分支节点
│       │   └── FlowRouteNode.vue // 路由节点
│       └── panel
│           └── EditPanel.vue // 配置编辑面板
├── lib // 核心工具类
│   ├── flow.js
│   ├── outputBranch.js
│   └── utils.js
```

不同项目，在审批流业务配置上有较大的区别，所以本示例代码中移除了所有业务相关的逻辑，用户可以根据自己需要进行业务配置扩展。
