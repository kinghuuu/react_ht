import _ from 'lodash';
import {
    UPDATE_DATA_AUDIT_PROCESSING_LIST,
    UPDATE_DATA_AUDIT_PROCESSING_LIST_LOADING,
    UPDATE_DATA_AUDIT_PROCESSING_LIST_PAGINATION
} from '../../constants/dataAuditProcessing/actionType';

// 登录状态
const initState = {
    rows: [],
    results: 0,
    buttonLoading: false,
    tableLoading: false,
    pagination: {
        pageIndex: 0,
        limit: 10
    },
};

let switchMap = {};

switchMap[UPDATE_DATA_AUDIT_PROCESSING_LIST] = (state, action) => {
    const { rows, results } = action.payload;
    console.log(action.payload)
    return Object.assign({}, state, { rows, results });
};
switchMap[UPDATE_DATA_AUDIT_PROCESSING_LIST_LOADING] = (state, action) => {
    return Object.assign({}, state, action.payload);
};
switchMap[UPDATE_DATA_AUDIT_PROCESSING_LIST_PAGINATION] = (state, action) => {
    return Object.assign({}, state, { pagination: action.payload });
};

function dataAuditProcessing(state = initState, action) {
    const { type = '' } = action;
    if (switchMap[type]) {
        return switchMap[type](state, action);
    }
    return state
}

export { dataAuditProcessing };
