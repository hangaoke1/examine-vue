export default class FlowEditorStore {
  /**
   * 输出XML
   * @param {string} name 审批流名称
   * @returns 
   */
  buildXML(name) {
    const json = this.buildXMLObject(name)
    return xmlConvert.json2xml(json, {
      compact: true,
      ignoreComment: true,
      spaces: 4,
    })
  }
  /**
   * 输出XML描述对象
   * @param {string} name 审批流名称
   * @returns 
   */
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
        item._attributes = Object.assign(item._attributes, this.convertNode(node))
      } else if (node.type === 'ACTION') {
        item._attributes = Object.assign(item._attributes, this.convertNode(node))
      }

      const lineList = result.lineList.filter(v => v.srcId === node.id)
      const transitionList = lineList.map(line => {
        if (node.type === 'ROUTE') {
          const condition = (line.conditionGroupList || []).map(conditionGroup => {
            return conditionGroup.map(condition => {
              this.convertNode(condition)
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

    nodeMap.forEach((nodeList, type) => {
      const tagName = this.nodeTypeToTag[type]
      if (nodeList.length) {
        xmlObject.process[tagName] = nodeList
      }
    })
    return xmlObject
  }
}
