/* eslint-disable indent */
import _ from 'lodash'
import { nanoid } from 'nanoid'

export default class FlowEditorStore {
  constructor({ rootNode } = {}) {
    this.rootNode = rootNode || this.initDefault()
    this.nodeTypes = ['START', 'END', 'APPROVAL', 'ACTION', 'ROUTE', 'BRANCH', 'CONDITION']
    this.errorNodes = []
    this.idNodeMap = new Map()
    this.idParentMap = new Map()
    this.typeIdNodeMap = new Map(
      this.nodeTypes.map(v => {
        return [v, new Map()]
      }),
    )
    this.addDescendantsToMap(this.rootNode)
  }

  buildXMLObject(name) {
    const nodeMap = new Map()
    const result = { lineList: [], nodeList: [] }
    const xmlObject = {
      process: {
        _attributes: {
          displayName: encodeXMLAttr(name || '审批流程'),
          name: 'process',
        },
      },
    }

    outputBranch(result, this.rootNode)

    result.nodeList.forEach(node => {
      const item = {
        _attributes: {
          displayName: encodeXMLAttr(node.name),
          name: node.id,
        },
      }
      if (node.type === 'APPROVAL') {
        item._attributes = Object.assign(item._attributes, this.convertApproval(node))
      } else if (node.type === 'ACTION') {
        item._attributes = Object.assign(item._attributes, this.convertAction(node))
      }

      const lineList = result.lineList.filter(v => v.srcId === node.id)
      const transitionList = lineList.map(line => {
        if (node.type === 'ROUTE') {
          const condition = line.conditionGroupList.map(conditionGroup => {
            return conditionGroup.map(condition => {
              this.convertCondition(condition)
            })
          })
          return {
            _attributes: {
              displayName: encodeXMLAttr(line.name),
              name: line.id,
              expr: JSON.stringify(condition),
              to: line.dstId,
            },
          }
        } else {
          return {
            _attributes: {
              name: line.id,
              to: line.dstId,
            },
          }
        }
      })

      if (transitionList.length) {
        item.transition = transitionList
      }

      const l = nodeMap.get(node.type)
      nodeMap.set(node.type, Array.isArray(l) ? [...l, item] : [item])
    })

    const tagMap = {
      START: 'start',
      END: 'end',
      APPROVAL: 'task',
      ACTION: 'custom',
      ROUTE: 'decision',
    }

    nodeMap.forEach((nodeList, type) => {
      const tagName = tagMap[type]
      if (nodeList.length) {
        xmlObject.process[tagName] = nodeList
      }
    })
    return xmlObject
  }

  buildXML(name) {
    const json = this.buildXMLObject(name)
    return xmlConvert.json2xml(json, {
      compact: true,
      ignoreComment: true,
      spaces: 4,
    })
  }

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

  // 添加当前节点及其后代到map
  addDescendantsToMap(node, parent) {
    this.addNodeToMap(node, parent)
    node.data.children.forEach(subNode => {
      this.addDescendantsToMap(subNode, node)
    })
  }

  addNodeToMap(node, parent) {
    this.idNodeMap.set(node.id, node)
    this.idParentMap.set(node.id, parent)
    this.typeIdNodeMap.get(node.type).set(node.id, node)
  }

  // 从map中删除当前节点及其后代
  deleteDescendantsFromMap(node) {
    this.deleteNodeFromMap(node)
    node.data.children.forEach(subNode => {
      this.deleteDescendantsFromMap(subNode)
    })
  }

  deleteNodeFromMap(node) {
    this.idNodeMap.delete(node.id)
    this.idParentMap.delete(node.id)
    this.typeIdNodeMap.get(node.type).delete(node.id)
  }

  // 深度递归方式查找节点
  findNodeById(id) {
    return this.findNodeRecursively(this.rootNode, id)
  }

  findNodeRecursively(node, id) {
    if (node.id === id) {
      return node
    }
    const children = node.data.children
    for (let i = 0; i < children.length; i++) {
      const cNode = children[i]
      const fNode = this.findNodeRecursively(cNode, id)
      if (fNode) {
        return fNode
      }
    }
  }

  /**
   * 创建开始节点
   * @returns {node}
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
   * @returns {node}
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
   * @returns {node}
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
   * @returns {node}
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
   * @returns {node}
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

    routeNode.data.children = new Array(2).fill('').map((item, index) => {
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
   * @returns {node}
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
   * @returns {node}
   */
  createConditionNode({ parentBranchId, isDefault, index = '' }) {
    return {
      id: `CONDITION_${nanoid()}`,
      type: 'CONDITION',
      isError: false,
      errors: [],
      parentBranchId,
      data: {
        children: [],
        name: isDefault ? '默认' : '条件节点' + index,
        isDefault: !!isDefault, // 默认分支，不可修改，不可编辑
      },
    }
  }

  /**
   * 添加节点
   * @param {string} preNodeId 当前节点id
   * @param {string} nodeType 需要添加的节点类型
   */
  addNext(preNodeId, nodeType) {
    let node
    const parentNode = this.idParentMap.get(preNodeId)
    const nodeList = parentNode.data.children
    const index = nodeList.indexOf(this.idNodeMap.get(preNodeId)) + 1
    if (nodeType === 'APPROVAL') {
      node = this.createApprovalNode({
        parentBranchId: parentNode.id,
      })
    } else if (nodeType === 'ACTION') {
      node = this.createActionNode({
        parentBranchId: parentNode.id,
      })
    } else if (nodeType === 'ROUTE') {
      node = this.createRouteNode({
        parentBranchId: parentNode.id,
      })
    }

    this.insertChild(node, parentNode, index)
  }

  /**
   * 插入节点
   * @param {Node} node 需要插入的节点
   * @param {Node} parentNode 父节点
   * @param {number} index 插入位置
   */
  insertChild(node, parentNode, index) {
    parentNode.data.children.splice(index, 0, node)
    this.addDescendantsToMap(node, parentNode)
  }

  /**
   * 添加节点
   * @param {Node} node 需要插入的节点
   * @param {Node} parentNode 父节点
   * @param {number} index 插入位置，默认队尾
   */
  addChild(node, parentNode, index) {
    this.insertChild(
      node,
      parentNode,
      index !== undefined ? index : parentNode.data.children.length,
    )
  }

  /**
   * 添加BRANCH节点
   * @param {string} routeId ROUTE节点id
   */
  addBranch(routeId) {
    const routeNode = this.idNodeMap.get(routeId)
    const branchNode = this.createBranchNode({ parentRouteId: routeId })
    const conditionNode = this.createConditionNode({
      parentBranchId: branchNode.id,
      index: routeNode.data.children.length,
    })
    branchNode.data.children.push(conditionNode)

    this.addChild(branchNode, routeNode, routeNode.data.children.length - 1)
    this.updatePriority(routeNode)
  }

  /**
   * 移动CONDITION节点
   * @param {string} id CONDITION节点id
   * @param {string} to 目标位置
   */
  moveCondition(id, to) {
    const conditionNode = this.idNodeMap.get(id)
    const branchNode = this.idParentMap.get(conditionNode.id)
    const routeNode = this.idParentMap.get(branchNode.id)
    // 交换位置
    const from = routeNode.data.children.indexOf(branchNode)
    const toBranchNode = routeNode.data.children[to]

    routeNode.data.children[from] = toBranchNode
    routeNode.data.children[to] = branchNode

    routeNode.data.children = [...routeNode.data.children]

    // 更新权重
    this.updatePriority(routeNode)
  }

  /**
   * 更新条件分支权重
   * @param {Node} routeNode ROUTE节点
   */
  updatePriority(routeNode) {
    routeNode.data.children.forEach((branchNode, index) => {
      branchNode.data.children[0].data.priority = index + 1
    })
  }

  /**
   * 更新节点data属性
   * @param {string} id 节点id
   * @param {object} data 节点业务数据
   */
  updateNodeData(id, data) {
    const node = this.idNodeMap.get(id)
    node.data = data
  }

  /**
   * 删除节点
   * @param {string} id 节点id
   */
  deleteNode(id) {
    const node = this.idNodeMap.get(id)
    if (['APPROVAL', 'ACTION'].includes(node.type)) {
      const branchNode = this.idParentMap.get(id)
      branchNode.data.children.splice(branchNode.data.children.indexOf(node), 1)
      this.deleteDescendantsFromMap(node)
    }
    if (node.type === 'CONDITION') {
      const branchNode = this.idParentMap.get(id)
      const routeNode = this.idParentMap.get(branchNode.id)
      if (routeNode.data.children.length > 2) {
        // 删除当前branch
        routeNode.data.children.splice(routeNode.data.children.indexOf(branchNode), 1)
        this.deleteDescendantsFromMap(branchNode) // 删除branchNode下所有节点的map映射
        this.updatePriority(routeNode)
      } else {
        // 删除整棵route
        const routeParentNode = this.idParentMap.get(routeNode.id)
        routeParentNode.data.children.splice(routeParentNode.data.children.indexOf(routeNode), 1)
        this.deleteDescendantsFromMap(routeNode)
      }
    }
  }

  // 节点数据校验，根据业务实际情况，自定义校验规则
  validate() {
    this.errorNodes = []
    this.validateNode(this.rootNode)
  }

  validateNode(rootNode) {
    rootNode.data.children.forEach(node => {
      switch (node.type) {
        case 'START':
          node.isError = !this.validateStart(node)
          break
        case 'APPROVAL':
          node.isError = !this.validateApproval(node)
          break
        case 'ACTION':
          node.isError = !this.validateAction(node)
          break
        case 'CONDITION':
          node.isError = !this.validateCondition(node)
          break
        case 'END':
          node.isError = !this.validateEnd(node)
          break
        case 'BRANCH':
        case 'ROUTE':
          this.validateNode(node)
          break
        default:
      }
      if (node.isError) {
        this.errorNodes.push(node)
      }
    })
  }

  validateStart(node) {
    return true
  }

  validateEnd(node) {
    return true
  }

  validateApproval(node) {
    return true
  }

  validateAction(node) {
    return true
  }

  validateCondition(node) {
    return true
  }
}
