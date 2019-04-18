import PropTypes from 'prop-types'

import * as types from './types'

export const TreeNodeType = {
    FILE: 'FILE',
    DIRECTORY: 'DIRECTORY',
    PLAYLIST: 'PLAYLIST',
}

function lazyFunction(f) {
    return function () {
        return f.apply(this, arguments);
    }
}

const lazyTreeType = lazyFunction(function () { 
    return TreeType
})

export const TreeType = PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf([TreeNodeType.FILE, TreeNodeType.DIRETORY, TreeNodeType.PLAYLIST]),
    fullPath: PropTypes.string,
    children: PropTypes.arrayOf(lazyTreeType)
})

const initialState = {
    tree: null,
    currentDir: [''],
}

const nodeFromPath = (path, tree) => {
    let node = tree
    
    if (path.length < 2 && path[0] == node.name) {
        return node
    }

    path.slice(1).forEach((element) => {
        node = node.children.filter((child) => child.name === element)[0]
    })

    return node
}

export const browserReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.TREE_UPDATED:
            const { path, content } = action
            
            let root = state.tree

            let parent = root
            if (parent === null) {
                parent = {
                    name: '',
                    type: TreeNodeType.DIRECTORY,
                    fullPath: '',
                    children: [],
                }
                root = parent
            } else {
                parent = nodeFromPath(path, parent)
            }
            
            parent.children = content
            
            return {
                currentDir: path,
                tree: root,
            }             
        default:
            return state
    }
}
