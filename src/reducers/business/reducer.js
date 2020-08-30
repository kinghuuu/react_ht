import _ from 'lodash';
import {
    UPDATE_BUSINESS_ATTRIBUTE_LIST,
    UPDATE_BUSINESS_ATTRIBUTE_LIST_LOADING,
    UPDATE_BUSINESS_ATTRIBUTE_LIST_PAGINATION,
} from '../../constants/business/actionType';

// 新增、删除
let setRowsIntoItemById = (ItemId, rows, allRows) => {
    let findItems = (list) => {
        list.forEach(item => {
            const { id, children } = item;
            let isSome = Number.parseInt(ItemId) === Number.parseInt(id);
            if (isSome) {
                item.children = rows;
            } else {
                if (_.isArray(children)) {
                    findItems(children);
                }
            }
        })
    };
    findItems(allRows);
    return allRows
}
// 编辑
let setEditDataIntoItemById = (editId, rows, allRows) => {
    let findItems = (list) => {
        list.forEach(item => {
            const { id, children } = item;
            let isSome = Number.parseInt(editId) === Number.parseInt(id);
            if (isSome) {
                let { businessName, description } = rows.find(row => row.id === Number.parseInt(editId)) || {};
                item.businessName = businessName;
                item.description = description;
            } else {
                if (_.isArray(children)) {
                    findItems(children);
                }
            }
        })
    };
    findItems(allRows);
    return allRows
}

// 登录状态
const initState = {
    rows: [],
    results: 0,
    buttonLoading: false,
    tableLoading: false,
    pagination: {
        pageIndex: 0,
        limit: 50
    }
};

let switchMap = {};

switchMap[UPDATE_BUSINESS_ATTRIBUTE_LIST] = (state, action) => {
    const { rows, results, parentId, editId } = action.payload;
    let stateCopy = _.cloneDeep(state);
    let newRows = rows;
    if (editId) {
        // 编辑需要单独处理
        newRows = setEditDataIntoItemById(editId, rows, stateCopy.rows);
    } else {
        // 这里是新增，删除
        if (parentId !== '-1') {
            // parentId === '-1'，即请求全部，没有点击展开
            newRows = setRowsIntoItemById(parentId, rows, stateCopy.rows);
        }
    }
    stateCopy.rows = newRows;
    stateCopy.results = results;
    return stateCopy;
};
switchMap[UPDATE_BUSINESS_ATTRIBUTE_LIST_LOADING] = (state, action) => {
    return Object.assign({}, state, action.payload);
};
switchMap[UPDATE_BUSINESS_ATTRIBUTE_LIST_PAGINATION] = (state, action) => {
    return Object.assign({}, state, { pagination: action.payload });
};

function business(state = initState, action) {
    if (_.isEqual(action.type, UPDATE_BUSINESS_ATTRIBUTE_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_BUSINESS_ATTRIBUTE_LIST_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_BUSINESS_ATTRIBUTE_LIST_PAGINATION) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

export { business };
