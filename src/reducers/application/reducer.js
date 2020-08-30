import _ from 'lodash';
import {
    UPDATE_IP_DIMENSIONS_RELATION,
    UPDATE_IP_DIMENSIONS_RELATION_PAGINATION,
    UPDATE_IP_DIMENSIONS_RELATION_LOADING,
    UPDATE_IP_DIMENSIONS_DETAILS,
    UPDATE_IP_DIMENSIONS_DETAILS_LOADING,
    UPDATE_IP_DIMENSIONS_DETAILS_OTHER,
    UPDATE_DATABASE_INSTANCE_LIST,
    UPDATE_DATABASE_INSTANCE_LIST_LOADING,
    UPDATE_DATABASE_INSTANCE_IP_LIST,
    UPDATE_DATABASE_INSTANCE_IP_LIST_LOADING,
    UPDATE_DATABASE_INSTANCE_IP_LIST_PAGINATION,
} from '../../constants/application/actionTypes';

const DETAILAPPLICATIONMODULE = 'DETAILAPPLICATIONMODULE'
const DETAILPROGRAMMODULE = 'DETAILPROGRAMMODULE'
const CUSTOMATTRIBUTEMODULE = 'CUSTOMATTRIBUTEMODULE'
const RECORDMODULE = 'RECORDMODULE'
const UPDATE_RESOURCE_PAGINATION_APPLICATION = 'UPDATE_RESOURCE_PAGINATION_APPLICATION';
const UPDATE_RESOURCE_TABLE_LOADING_APPLICATION = 'UPDATE_RESOURCE_TABLE_LOADING_APPLICATION';
const UPDATE_RESOURCE_INFO_APPLICATION = 'UPDATE_RESOURCE_INFO_APPLICATION';
const UPDATE_TREE_LOADING = 'UPDATE_TREE_LOADING';
const UPDATE_CONTENT_LOADING = 'UPDATE_CONTENT_LOADING';
const CUSTOMGROUPMODULE = 'CUSTOMGROUPMODULE';
const SEARCH_CUSTOM_GROUP_LIST = 'SEARCH_CUSTOM_GROUP_LIST';
const SEARCH_GROUP_VALUES = 'SEARCH_GROUP_VALUES';
const RELATIONVALUE = 'RELATIONVALUE'


const initApplicationState = {
    treeLoading: false,
    contentLoading: false,
    resource: {
        rows: [],
        tableLoading: false,
        results: 0,
        pagination: {
            limit: 50,
            pageIndex: 0,
        },
    },
};

//资源
export const applicationResource = (state = initApplicationState, action) => {
    switch (action.type) {
        case UPDATE_TREE_LOADING:
            return Object.assign({}, state, { treeLoading: action.payload });
        case UPDATE_CONTENT_LOADING:
            return Object.assign({}, state, { contentLoading: action.payload });
        case UPDATE_RESOURCE_PAGINATION_APPLICATION:
            return Object.assign({}, state, { resource: { ...state.resource, pagination: action.payload } });
        case UPDATE_RESOURCE_TABLE_LOADING_APPLICATION:
            return Object.assign({}, state, { resource: { ...state.resource, tableLoading: action.payload } });
        case UPDATE_RESOURCE_INFO_APPLICATION:
            return Object.assign({}, state, { resource: { ...state.resource, rows: action.payload.rows, results: action.payload.results } });
        default:
            return state;
    }
};

//应用详情
export const detailApplicationList = (state = '', action) => {
    switch (action.type) {
        case DETAILAPPLICATIONMODULE:
            return action.payload
        default:
            return state
    }
}

//程序详情
export const detailProgramList = (state = '', action) => {
    switch (action.type) {
        case DETAILPROGRAMMODULE:
            return action.payload
        default:
            return state
    }
}

//程序自定义属性
export const customAttributeList = (state = '', action) => {
    switch (action.type) {
        case CUSTOMATTRIBUTEMODULE:
            return action.payload
        default:
            return state
    }
}

//程序自定义分组
export const customGroupList = (state = '', action) => {
    switch (action.type) {
        case CUSTOMGROUPMODULE:
            return action.payload
        default:
            return state
    }
}

//程序自定义分组——用于查询
export const searchCustomGroupList = (state = '', action) => {
    switch (action.type) {
        case SEARCH_CUSTOM_GROUP_LIST:
            return action.payload
        default:
            return state
    }
}

//左侧程序自定义分组值
export const searchGroupValues = (state = '', action) => {
    switch (action.type) {
        case SEARCH_GROUP_VALUES:
            return action.payload
        default:
            return state
    }
}

//变更记录
export const recordList = (state = '', action) => {
    switch (action.type) {
        case RECORDMODULE:
            return action.payload
        default:
            return state
    }
}

//联动属性值
export const relationValueList = (state = '', action) => {
    switch (action.type) {
        case RELATIONVALUE:
            return action.payload
        default:
            return state
    }
}


const intiIpDimensions = {
    details: {

    },
    detailsOther: [],
    detailsLoading: false,
    relation: {
        List: [],
        tableLoading: false,
        results: 0,
        pagination: {
            limit: 50,
            pageIndex: 0,
        },
    }
}

let switchMap = {};
switchMap[UPDATE_IP_DIMENSIONS_RELATION] = (state, action) => {
    const { rows, results } = action.payload;
    return Object.assign({}, state, { relation: { ...state.relation, rows, results } });
};
switchMap[UPDATE_IP_DIMENSIONS_RELATION_PAGINATION] = (state, action) => {
    const { limit, pageIndex } = action.payload;
    return Object.assign({}, state, { relation: { ...state.relation, pagination: { limit, pageIndex } } });
};
switchMap[UPDATE_IP_DIMENSIONS_RELATION_LOADING] = (state, action) => {
    const { tableLoading } = action.payload;
    return Object.assign({}, state, { relation: { ...state.relation, tableLoading } });
};
switchMap[UPDATE_IP_DIMENSIONS_DETAILS] = (state, action) => {
    return Object.assign({}, state, { details: action.payload });
};
switchMap[UPDATE_IP_DIMENSIONS_DETAILS_LOADING] = (state, action) => {
    const { tableLoading } = action.payload;
    return Object.assign({}, state, { detailsLoading: tableLoading });
};
switchMap[UPDATE_IP_DIMENSIONS_DETAILS_OTHER] = (state, action) => {
    return Object.assign({}, state, { detailsOther: action.payload });
};

//IP维度查询
export const ipDimensions = (state = intiIpDimensions, action) => {
    if (_.isEqual(action.type, UPDATE_IP_DIMENSIONS_RELATION) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_IP_DIMENSIONS_RELATION_PAGINATION) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_IP_DIMENSIONS_RELATION_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_IP_DIMENSIONS_DETAILS) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_IP_DIMENSIONS_DETAILS_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_IP_DIMENSIONS_DETAILS_OTHER) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}


const intiDatabaseInstance = {
    dbInstacceList: [],
    dbInstacceLoading: false,
}
switchMap[UPDATE_DATABASE_INSTANCE_LIST] = (state, action) => {
    return Object.assign({}, state, { dbInstacceList: action.payload });
};
switchMap[UPDATE_DATABASE_INSTANCE_LIST_LOADING] = (state, action) => {
    const { dbInstacceLoading } = action.payload;
    return Object.assign({}, state, { dbInstacceLoading });
};
switchMap[UPDATE_DATABASE_INSTANCE_IP_LIST] = (state, action) => {
    const { rows, results, parentId } = action.payload;
    let newState = _.cloneDeep(state);
    newState.dbInstacceList.forEach(item => {
        if (item.id === parentId) {
            item.ipList = rows;
            item.ipListResults = results;
        }
    });
    return newState;
};
switchMap[UPDATE_DATABASE_INSTANCE_IP_LIST_LOADING] = (state, action) => {
    const { ipListLoading, parentId } = action.payload;
    let newState = _.cloneDeep(state);
    newState.dbInstacceList.forEach(item => {
        if (item.id === parentId) {
            item.ipListLoading = ipListLoading;
        }
    });
    return newState;
};
switchMap[UPDATE_DATABASE_INSTANCE_IP_LIST_PAGINATION] = (state, action) => {
    const { limit, pageIndex, programId: parentId } = action.payload;
    let newState = _.cloneDeep(state);
    newState.dbInstacceList.forEach(item => {
        if (item.id === parentId) {
            item.ipListPagination = { limit, pageIndex };
        }
    });
    return newState;
};


//IP维度查询
export const databaseInstance = (state = intiDatabaseInstance, action) => {
    if (_.isEqual(action.type, UPDATE_DATABASE_INSTANCE_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_DATABASE_INSTANCE_LIST_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_DATABASE_INSTANCE_IP_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_DATABASE_INSTANCE_IP_LIST_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_DATABASE_INSTANCE_IP_LIST_PAGINATION) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}




