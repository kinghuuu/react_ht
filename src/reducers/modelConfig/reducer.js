import _ from 'lodash';
import {
    UPDATE_MODEL_CONFIG_LIST,
    UPDATE_MODEL_CONFIG_LIST_LOADING,
    UPDATE_MODEL_CONFIG_LIST_PAGINATION,
    UPDATE_MODEL_CONFIG_RESOURCE_INFO,
    UPDATE_MODEL_CONFIG_RESOURCE_INFO_LOADING,
    UPDATE_MODEL_CONFIG_RESOURCE_INFO_PAGINATION,
} from '../../constants/modelConfig/actionType';

// 登录状态
const initState = {
    rows: [],
    results: 0,
    buttonLoading: false,
    tableLoading: false,
    pagination: {
        pageIndex: 0,
        limit: 50
    },
    resource: {
        rows: [],
        results: 0,
        buttonLoading: false,
        tableLoading: false,
        pagination: {
            pageIndex: 0,
            limit: 50
        }
    }
};

let switchMap = {};

switchMap[UPDATE_MODEL_CONFIG_LIST] = (state, action) => {
    const { rows, results } = action.payload;
    return Object.assign({}, state, { rows, results });
};
switchMap[UPDATE_MODEL_CONFIG_LIST_LOADING] = (state, action) => {
    return Object.assign({}, state, action.payload);
};
switchMap[UPDATE_MODEL_CONFIG_LIST_PAGINATION] = (state, action) => {
    return Object.assign({}, state, { pagination: action.payload });
};

switchMap[UPDATE_MODEL_CONFIG_RESOURCE_INFO] = (state, action) => {
    const { rows, results } = action.payload;
    return Object.assign({}, state, { resource: { ...state.resource, rows, results } });
};
switchMap[UPDATE_MODEL_CONFIG_RESOURCE_INFO_LOADING] = (state, action) => {
    return Object.assign({}, state, { resource: { ...state.resource, ...action.payload } });
};
switchMap[UPDATE_MODEL_CONFIG_RESOURCE_INFO_PAGINATION] = (state, action) => {
    return Object.assign({}, state, { resource: { ...state.resource, pagination: action.payload } });
};

function modelConfig(state = initState, action) {
    if (_.isEqual(action.type, UPDATE_MODEL_CONFIG_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_MODEL_CONFIG_LIST_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_MODEL_CONFIG_LIST_PAGINATION) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_MODEL_CONFIG_RESOURCE_INFO) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_MODEL_CONFIG_RESOURCE_INFO_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_MODEL_CONFIG_RESOURCE_INFO_PAGINATION) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

export { modelConfig };
