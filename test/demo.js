import _ from 'lodash'
import nanoid from 'nanoid'

export default class FlowEditorStore {
  constructor({ rootNode } = {}) {
    this.rootNode = rootNode || this.initDefault()
    this.nodeTypes = ['START', 'END', 'APPROVAL', 'ACTION', 'ROUTE', 'BRANCH', 'CONDITION']
  }

  /**
   * 初始化节点
   * @returns {Node}
   */
  initDefault() {
    const startNode = this.createStartNode()
    const endNode = this.createEndNode()
    const approvalNode = this.createApprovalNode({ parentBranchId: 'ROOT' })
    return {
      id: 'ROOT',
      type: 'BRANCH',
      isError: false,
      errors: [],
      data: {
        children: [startNode, approvalNode, endNode],
      },
    }
  }

  /**
   * 根据id查找节点
   * @param {string} id 节点id
   */
  findNodeById(id) {}

  /**
   * 创建开始节点
   * @returns {Node}
   */
  createStartNode() {
    return {
      id: 'START',
      type: 'START',
      isError: false,
      errors: [],
      parentBranchId: 'ROOT',
      data: {
        children: [],
        name: '开始',
      },
    }
  }

  /**
   * 创建结束节点
   * @returns {Node}
   */
  createEndNode() {
    return {
      id: 'END',
      type: 'END',
      isError: false,
      errors: [],
      parentBranchId: 'ROOT',
      data: {
        children: [],
        name: '结束',
      },
    }
  }

  /**
   * 创建审批节点
   * @param {string} parentBranchId 父分支id
   * @returns {Node}
   */
  createApprovalNode({ parentBranchId }) {
    const node = {
      id: `APPROVAL_${nanoid()}`,
      type: 'APPROVAL',
      isError: false,
      errors: [],
      parentBranchId,
      data: {
        children: [],
        name: '审批',
      },
    }
    return node
  }

  /**
   * 创建动作节点
   * @param {string} parentBranchId 父分支id
   * @returns {Node}
   */
  createActionNode({ parentBranchId }) {
    return {
      id: `ACTION_${nanoid()}`,
      type: 'ACTION',
      isError: false,
      errors: [],
      parentBranchId,
      data: {
        children: [],
        name: '动作',
      },
    }
  }

  /**
   * 创建路由节点
   * @param {string} parentBranchId 父分支id
   * @returns {Node}
   */
  createRouteNode({ parentBranchId }) {
    const routeNode = {
      id: `ROUTE_${nanoid()}`,
      type: 'ROUTE',
      isError: false,
      errors: [],
      parentBranchId,
      data: {
        children: [],
        name: '路由',
      },
    }

    routeNode.data.children = new Array(2).fill('').map((_item, index) => {
      const branchNode = this.createBranchNode({ parentRouteId: routeNode.id })
      const conditionNode = this.createConditionNode({
        parentBranchId: branchNode.id,
        isDefault: index === 1,
        index: index + 1,
      })
      branchNode.data.children.push(conditionNode)
      return branchNode
    })

    return routeNode
  }

  /**
   * 创建分支节点
   * @param {string} parentRouteId 父路由节点id
   * @returns {Node}
   */
  createBranchNode({ parentRouteId }) {
    return {
      id: `BRANCH_${nanoid()}`,
      type: 'BRANCH',
      isError: false,
      errors: [],
      parentRouteId,
      data: {
        children: [],
        name: '分支',
      },
    }
  }

  /**
   * 创建条件节点
   * @param {string} parentBranchId 父BRANCH节点id
   * @param {boolean} isDefault 是否是默认节点
   * @param {number} index 节点所在分支序号
   * @returns {Node}
   */
  createConditionNode({ parentBranchId, isDefault, index = '' }) {
    return {
      id: `CONDITION_${nanoid()}`,
      type: 'CONDITION',
      isError: false,
      errors: [],
      parentBranchId,
      data: {
        priority: index,
        children: [],
        name: isDefault ? '默认' : '条件节点' + index,
        isDefault: !!isDefault, // 默认分支，不可修改，不可编辑
      },
    }
  }

  /**
   * 插入节点
   * @param {Node} node 需要插入的节点
   * @param {Node} parentNode 父节点
   * @param {number} index 插入位置
   */
  insertChild(node, parentNode, index) {}

  /**
   * 添加兄弟节点
   * @param {string} preNodeId 当前节点id
   * @param {string} nodeType 需要添加的节点类型
   */
  addNext(preNodeId, nodeType) {}

  /**
   * 添加子节点
   * @param {Node} node 需要插入的节点
   * @param {Node} parentNode 父节点
   * @param {number} index 插入位置，默认队尾
   */
  addChild(node, parentNode, index) {}

  /**
   * 添加BRANCH节点
   * @param {string} routeId ROUTE节点id
   */
  addBranch(routeId) {}

  /**
   * 更新节点data属性
   * @param {string} id 节点id
   * @param {object} data 节点业务数据
   */
  updateNodeData(id, data) {}

  /**
   * 删除节点
   * @param {string} id 节点id
   */
  deleteNode(id) {}

  /**
   * 移动CONDITION节点
   * @param {string} id CONDITION节点id
   * @param {string|number} to 目标位置
   */
  moveCondition(id, to) {}

  /**
   * 更新CONDITION节点权重
   * @param {Node} routeNode ROUTE节点
   */
  updateConditionPriority(routeNode) {}

  /**
   * 节点数据校验，根据业务实际情况，自定义校验规则
   */
  validate() {}
}
