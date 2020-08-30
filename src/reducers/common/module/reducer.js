import {
    UPDATE_ASSET_TYPE,
    UPDATE_MY_COLUMNS,
    UPDATE_MODULE_AUTH
} from '../../../constants/common/module/actionTypes';
import _ from 'lodash';

const assetTypesInitData = [];
const myColumnsData = [];
const moduleAuthData = {};

let switchMap = {};

switchMap[UPDATE_ASSET_TYPE] = (state, action) => {
    return [...action.payload];
};
switchMap[UPDATE_MY_COLUMNS] = (state, action) => {
    return [...action.payload];
};
switchMap[UPDATE_MODULE_AUTH] = (state, action) => {
    return { ...action.payload };
};

function assetTypes(state = assetTypesInitData, action) {
    if (_.isEqual(action.type, UPDATE_ASSET_TYPE) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

function myColumns(state = myColumnsData, action) {
    if (_.isEqual(action.type, UPDATE_MY_COLUMNS) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

function moduleAuth(state = moduleAuthData, action) {
    if (_.isEqual(action.type, UPDATE_MODULE_AUTH) && switchMap[action.type]) {
        return switchMap[action.type](state, action);
    } else {
        return state;
    }
}

export {
    assetTypes,
    myColumns,
    moduleAuth
};