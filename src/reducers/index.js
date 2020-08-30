import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { login, modify } from './login/reducer';
import { menus, collapsed } from './home/reducer';
import { user } from './user/reducer';
import { assetTypes, myColumns, moduleAuth } from './common/module/reducer';
import {
    flowUserInfo,
    appSys4Page,
    allAppSys4Page,
    attachList,
    approveHisStep,
    allocationIp,
    opinionList,
    flowBasicInfo,
    flowAuditInfo
} from './common/flow/reducer';
import { applicationResource, detailApplicationList, detailProgramList, customAttributeList, customGroupList, recordList, relationValueList, searchGroupValues, searchCustomGroupList, ipDimensions, databaseInstance } from './application/reducer';
import { cmdbServeList } from './application/service/reducer';
import { oracleList, mysqlList } from './application/database/reducer';
import { selfDefining } from './selfDefining/reducer';
import { modelConfig } from './modelConfig/reducer';
import { business } from './business/reducer';
import { resource } from './resource/reducer';
import { maintenance } from './maintenance/reducer';
import { contract } from './contract/reducer';
import { dataAuditProcessing } from './dataAuditProcessing/reducer';


const rootReducer = combineReducers({
    routing: routerReducer,
    login,
    modify,
    menus,
    collapsed,
    user,
    flowUserInfo,
    appSys4Page,
    allAppSys4Page,
    attachList,
    approveHisStep,
    opinionList,
    allocationIp,
    flowBasicInfo,
    assetTypes,
    myColumns,
    moduleAuth,
    flowAuditInfo,
    applicationResource,
    detailApplicationList,
    detailProgramList,
    customAttributeList,
    customGroupList,
    recordList,
    searchGroupValues,
    searchCustomGroupList,
    relationValueList,
    cmdbServeList,
    oracleList,
    mysqlList,
    ipDimensions,
    databaseInstance,
    selfDefining,
    modelConfig,
    business,
    resource,
    maintenance,
    contract,
    dataAuditProcessing
});

export default rootReducer;