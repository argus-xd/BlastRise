export function findDeep(node, nodeName) {
    if (node.name == nodeName) return node;
    for (var i = 0; i < node.children.length; i++) {
        var res = this.findDeep(node.children[i], nodeName);
        if (res) return res;
    }
}
