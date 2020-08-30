import { UPDATE_CMDBSERVE_LIST, UPDATE_CMDBSERVE_LIST_LOADING } from "../../../constants/application/service/actionTypes";
import _ from 'lodash';

// CMDB--服务列表
const cmdbServeListData = {
    results: 0,
    rows: [],
    success: false,
    tableLoading: false,
};

let switchMap = {};

switchMap[UPDATE_CMDBSERVE_LIST_LOADING] = (state, action) => {
    return Object.assign({}, state, {tableLoading:action.payload.tableLoading});
};

switchMap[UPDATE_CMDBSERVE_LIST] = (state, action) => {
    return {
        ...action.payload
    };
};

function cmdbServeList(state = cmdbServeListData, action) {
    if (_.isEqual(action.type, UPDATE_CMDBSERVE_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    }else if (_.isEqual(action.type, UPDATE_CMDBSERVE_LIST_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

export {
    cmdbServeList
};