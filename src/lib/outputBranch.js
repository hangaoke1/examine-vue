import { nanoid } from 'nanoid';

/**
 * 将 nodeTree 转换成 { lineList: [], nodeList: [] }
 * @param {object} result {lineList: [], nodeList: [] }
 * @param {Node} branchNode branch节点
 * @param {Node} routeNode route节点
 */
export function outputBranch(result, branchNode, routeNode) {
  const nodeType = ['START', 'END', 'ROUTE', 'APPROVAL', 'ACTION']; // 五种节点类型

  branchNode.data.children.forEach((node, index) => {
    // 输出节点
    if (nodeType.includes(node.type)) {
      result.nodeList.push(Object.assign({ type: node.type, id: node.id }, node.data));
    }

    if (index === 0) {
      // branch分支的第一个节点
      if (node.type === 'CONDITION') {
        outputLine(result, null, node, routeNode);
      }
    } else {
      outputLine(result, branchNode.data.children[index - 1], node, routeNode);
    }
  });
}

function outputLine(result, preNode, currentNode, routeNode) {
  const line = {
    id: '',
    name: '',
    dstId: '',
    srcId: '',
    priority: 1,
    conditionGroupList: [],
  };

  switch (currentNode.type) {
    case 'APPROVAL':
      if (['START', 'APPROVAL', 'ACTION'].includes(preNode.type)) {
        Object.assign(line, {
          id: `LINE_${nanoid(8)}`,
          srcId: preNode.id,
          dstId: currentNode.id,
        });
        result.lineList.push(line);
      }
      break;
    case 'ACTION':
      if (['START', 'APPROVAL', 'ACTION'].includes(preNode.type)) {
        Object.assign(line, {
          id: `LINE_${nanoid(8)}`,
          srcId: preNode.id,
          dstId: currentNode.id,
        });
        result.lineList.push(line);
      }
      break;
    case 'ROUTE':
      if (['START', 'APPROVAL', 'ACTION'].includes(preNode.type)) {
        Object.assign(line, {
          id: `LINE_${nanoid(8)}`,
          srcId: preNode.id,
          dstId: currentNode.id,
        });
        result.lineList.push(line);
      }
      // 递归子节点
      currentNode.data.children.forEach(function (node) {
        outputBranch(result, node, currentNode);
      });
      break;
    case 'CONDITION':
      line.id = currentNode.id;
      line.srcId = routeNode.id;
      line.priority = currentNode.data.priority;
      line.name = currentNode.data.name;
      line.conditionGroupList = currentNode.data.conditionGroupList;
      result.lineList.push(line);
      return;
    case 'END':
      if (['START', 'APPROVAL', 'ACTION'].includes(preNode.type)) {
        Object.assign(line, {
          id: `LINE_${nanoid(8)}`,
          srcId: preNode.id,
          dstId: currentNode.id,
        });
        result.lineList.push(line);
      }
      break;
    default:
  }

  // 如果前一个节点是条件节点则需要对条件节点生成line补齐dstId
  if (preNode.type === 'CONDITION') {
    result.lineList.find(e => {
      return e.id === preNode.id;
    }).dstId = currentNode.id;
  }

  // 前一个节点是ROUTE，则将ROUTE下，每项的最后一个节点 与当前节点相连
  // 防止单条branch只有条件节点的情况下，无法走到上面的分支，补齐dstId
  if (preNode.type === 'ROUTE') {
    outputRouteLineToNextNode(result, preNode, currentNode);
  }
}

/**
 *
 * @param {object} result
 * @param {Node} routeNode
 * @param {Node} currentNode
 */
function outputRouteLineToNextNode(result, routeNode, currentNode) {
  routeNode.data.children.forEach(branchNode => {
    const branchChildren = branchNode.data.children;
    const lastBranchChild = branchChildren[branchChildren.length - 1];
    const c = {
      id: `LINE_${nanoid(8)}`,
      dstId: currentNode.id,
      srcId: lastBranchChild.id,
      priority: 1,
      conditionGroupList: [],
    };

    if (lastBranchChild.type !== 'CONDITION') {
      if (lastBranchChild.type !== 'ROUTE') {
        result.lineList.push(c);
      } else {
        outputRouteLineToNextNode(result, lastBranchChild, currentNode);
      }
    } else {
      // 如果branch只有一个条件节点，则通过全局匹配，将原来未设置dstId的line找出，并赋值
      result.lineList.forEach(line => {
        // 匹配由条件节点生成的line
        line.id === lastBranchChild.id && (line.dstId = currentNode.id);
      });
    }
  });
}
