import {
    UPDATE_FLOW_USER_INFO,
    UPDATE_FLOW_BASIC_INFO,
    UPDATE_APP_SYS_4_PAGE,
    UPDATE_ALL_APP_SYS_4_PAGE,
    UPDATE_ATTACHMENT_LIST,
    UPDATE_APPROVE_HISTORY,
    UPDATE_REGULAR_OPINION,
    UPDATE_ALLOCATION_IP_IP_CONFIG_LIST,
    UPDATE_ALLOCATION_IP_ROUTE_CONFIG_LIST,
    UPDATE_ALLOCATION_IP_ROUTE_AND_IP_CONFIG_LOADING,
    UPDATE_ALLOCATION_IP_SEGMENT_LIST,
    UPDATE_ALLOCATION_IP_GENERATE_FROM_IP,
    UPDATE_ALLOCATION_IP_LIST_IP_POOL,
    UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LOADING,
    UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LIST,
    UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_PAGINATION,
    UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP,
    UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_ROUTES,
    UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP_LOADING,
    UPDATE_UP_DUTY_PERSION,
    UPDATE_INTERNAL_APPROVER,
    UPDATE_USERS_FOR_PAGE,
    UPDATE_INTERNAL_APPROVER_INFO,
} from '../../../constants/common/flow/actionType';
import _ from 'lodash';

const flowUserInfoData = {};
const flowBasicInfoData = {};
const appSys4PageData = {};
const allAppSys4PageData = {};
const attachListData = [];
const approveHisStepData = [];
const opinionListData = [];
const intiAllocationIp = {
    ipConfigs: [],
    routeConfigs: [],
    ipAndRouteTalbeLoading: true,
    segmentList: [],
    generateFromIp: {},
    listIpPool: [],
    availableIp: [],
    availableRoutes: [],
    availableIpLoading: false,
    queryIpConfigs: {
        buttonLoading: false,
        tableLoading: false,
        rows: [],
        results: 0,
        pagination: {
            limit: 50,
            pageIndex: 0
        },
    },
};

const initInternaApproverData = {
    upDutyPersionList: [],
    internalApproverList:[],
    usersForPageList:[],
    internalApproverInfoListList:[],
};



let switchMap = {};

switchMap[UPDATE_FLOW_BASIC_INFO] = (state, action) => {
    return { ...action.payload };
};
function flowBasicInfo(state = flowBasicInfoData, action) {
    if (_.isEqual(action.type, UPDATE_FLOW_BASIC_INFO) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

// 流程基本信息
switchMap[UPDATE_FLOW_USER_INFO] = (state, action) => {
    return { ...action.payload };
};
function flowUserInfo(state = flowUserInfoData, action) {
    if (_.isEqual(action.type, UPDATE_FLOW_USER_INFO) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

switchMap[UPDATE_APP_SYS_4_PAGE] = (state, action) => {
    return { ...action.payload };
};
function appSys4Page(state = appSys4PageData, action) {
    if (_.isEqual(action.type, UPDATE_APP_SYS_4_PAGE) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

switchMap[UPDATE_ALL_APP_SYS_4_PAGE] = (state, action) => {
    return { ...action.payload };
};
function allAppSys4Page(state = allAppSys4PageData, action) {
    if (_.isEqual(action.type, UPDATE_ALL_APP_SYS_4_PAGE) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

switchMap[UPDATE_ATTACHMENT_LIST] = (state, action) => {
    return [...action.payload];
};
function attachList(state = attachListData, action) {
    if (_.isEqual(action.type, UPDATE_ATTACHMENT_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

switchMap[UPDATE_APPROVE_HISTORY] = (state, action) => {
    return [...action.payload];
};
function approveHisStep(state = approveHisStepData, action) {
    if (_.isEqual(action.type, UPDATE_APPROVE_HISTORY) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

switchMap[UPDATE_REGULAR_OPINION] = (state, action) => {
    return [...action.payload];
};
function opinionList(state = opinionListData, action) {
    if (_.isEqual(action.type, UPDATE_REGULAR_OPINION) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

// 分配 IP 用到的页面
switchMap[UPDATE_ALLOCATION_IP_IP_CONFIG_LIST] = (state, action) => {
    return Object.assign({}, state, { ipConfigs: action.payload });
};
switchMap[UPDATE_ALLOCATION_IP_ROUTE_CONFIG_LIST] = (state, action) => {
    return Object.assign({}, state, { routeConfigs: action.payload });
};
switchMap[UPDATE_ALLOCATION_IP_ROUTE_AND_IP_CONFIG_LOADING] = (state, action) => {
    // console.log(action.payload);
    return Object.assign({}, state, { ipAndRouteTalbeLoading: action.payload.tableLoading });
};
switchMap[UPDATE_ALLOCATION_IP_SEGMENT_LIST] = (state, action) => {
    return Object.assign({}, state, { segmentList: action.payload });
};
switchMap[UPDATE_ALLOCATION_IP_GENERATE_FROM_IP] = (state, action) => {
    return Object.assign({}, state, { generateFromIp: action.payload });
};
switchMap[UPDATE_ALLOCATION_IP_LIST_IP_POOL] = (state, action) => {
    return Object.assign({}, state, { listIpPool: action.payload });
};
switchMap[UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LOADING] = (state, { payload: { buttonLoading, tableLoading } }) => {
    let newState = _.cloneDeep(state);
    newState.queryIpConfigs.buttonLoading = buttonLoading;
    newState.queryIpConfigs.tableLoading = tableLoading;
    return newState
};
switchMap[UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LIST] = (state, { payload: { rows, results } }) => {
    let newState = _.cloneDeep(state);
    newState.queryIpConfigs.rows = rows;
    newState.queryIpConfigs.results = results;
    return newState
};
switchMap[UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_PAGINATION] = (state, { payload }) => {
    let newState = _.cloneDeep(state);
    newState.queryIpConfigs.pagination = payload;
    return newState
};
switchMap[UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP] = (state, action) => {
    return Object.assign({}, state, { availableIp: action.payload });
};
switchMap[UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_ROUTES] = (state, action) => {
    return Object.assign({}, state, { availableRoutes: action.payload });
};
switchMap[UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP_LOADING] = (state, action) => {
    return Object.assign({}, state, { availableIpLoading: action.payload.loading });
};
function allocationIp(state = intiAllocationIp, action) {
    if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_IP_CONFIG_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_ROUTE_CONFIG_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_ROUTE_AND_IP_CONFIG_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_SEGMENT_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_GENERATE_FROM_IP) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_LIST_IP_POOL) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_PAGINATION) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_ROUTES) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}


switchMap[UPDATE_UP_DUTY_PERSION] = (state, action) => {
    let upDutyPersionList = action.payload ;
    return Object.assign({}, state, { upDutyPersionList });
};
switchMap[UPDATE_INTERNAL_APPROVER] = (state, action) => {
    return Object.assign({}, state, { internalApproverList: action.payload });
};
switchMap[UPDATE_USERS_FOR_PAGE] = (state, action) => {
    return Object.assign({}, state, { usersForPageList: action.payload });
};
switchMap[UPDATE_INTERNAL_APPROVER_INFO] = (state, action) => {
    return Object.assign({}, state, { internalApproverInfoList: action.payload });
};
function flowAuditInfo(state = initInternaApproverData, action) {
    if (_.isEqual(action.type, UPDATE_UP_DUTY_PERSION) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_INTERNAL_APPROVER) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_USERS_FOR_PAGE) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_INTERNAL_APPROVER_INFO) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

export {
    flowUserInfo,
    appSys4Page,
    allAppSys4Page,
    attachList,
    allocationIp,
    approveHisStep,
    opinionList,
    flowBasicInfo,
    flowAuditInfo,
};