import { UPDATE_ORACLE_LIST, UPDATE_ORACLE_LIST_LOADING,
    UPDATE_MYSQL_LIST, UPDATE_MYSQL_LIST_LOADING
 } from "../../../constants/application/database/actionTypes";
import _ from 'lodash';

// 程序--数据库列表
const oracleData = {
    results: 0,
    rows: [],
    success: false,
    tableLoading: false,
};

const mysqlData = {
    results: 0,
    rows: [],
    success: false,
    tableLoading: false,
};

let switchMap = {};

switchMap[UPDATE_ORACLE_LIST_LOADING] = (state, action) => {
    return Object.assign({}, state, { tableLoading: action.payload.tableLoading });
};

switchMap[UPDATE_ORACLE_LIST] = (state, action) => {
    return {
        ...action.payload
    };
};


switchMap[UPDATE_MYSQL_LIST_LOADING] = (state, action) => {
    return Object.assign({}, state, { tableLoading: action.payload.tableLoading });
};

switchMap[UPDATE_MYSQL_LIST] = (state, action) => {
    return {
        ...action.payload
    };
};

function oracleList(state = oracleData, action) {
    if (_.isEqual(action.type, UPDATE_ORACLE_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_ORACLE_LIST_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

function mysqlList(state = mysqlData, action) {
    if (_.isEqual(action.type, UPDATE_MYSQL_LIST) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else if (_.isEqual(action.type, UPDATE_MYSQL_LIST_LOADING) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

export {
    oracleList,
    mysqlList
};