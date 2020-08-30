import _ from 'lodash';
import {
    UPDATE_MAINTENANCE_LIST,
    UPDATE_MAINTENANCE_LIST_LOADING,
    UPDATE_MAINTENANCE_LIST_PAGINATION
} from '../../constants/maintenance/actionType';

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

switchMap[UPDATE_MAINTENANCE_LIST] = (state, action) => {
    const { rows, results } = action.payload;
    return Object.assign({}, state, { rows, results });
};
switchMap[UPDATE_MAINTENANCE_LIST_LOADING] = (state, action) => {
    return Object.assign({}, state, action.payload);
};
switchMap[UPDATE_MAINTENANCE_LIST_PAGINATION] = (state, action) => {
    return Object.assign({}, state, { pagination: action.payload });
};


function maintenance(state = initState, action) {
    if (_.isEqual(action.type, UPDATE_MAINTENANCE_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_MAINTENANCE_LIST_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_MAINTENANCE_LIST_PAGINATION) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

export { maintenance };
