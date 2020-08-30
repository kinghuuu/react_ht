import xFetch from '../../util/xFetch';
import { ContextPath } from '../../constants';
import { message } from 'antd';
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
const UPDATE_SEARCH_CUSTOM_GROUP_LIST = 'UPDATE_SEARCH_CUSTOM_GROUP_LIST';
const SEARCH_GROUP_VALUES = 'SEARCH_GROUP_VALUES';
const querySystemIpUrl = `${ContextPath}/cmdbSearch/querySystemIp`;
const queryIpBasicInfoUrl = `${ContextPath}/cmdbSearch/queryIpBasicInfo`;
const queryIpCategoryInfoUrl = `${ContextPath}/cmdbSearch/queryIpCategoryInfo`;
const queryIpProgramInfoUrl = `${ContextPath}/cmdbSearch/queryIpProgramInfo`;
const queryDbProgramInfoUrl = `${ContextPath}/cmdbSearch/queryDbProgramInfo`;
const queryProgramIpInfoUrl = `${ContextPath}/cmdbSearch/queryProgramIpInfo`;

//左侧程序自定义分组值
export const updateSearchGroupValues = (data) => {
    return {
        type: SEARCH_GROUP_VALUES,
        // type: UPDATE_SEARCH_CUSTOM_GROUP_LIST,
        payload: data
    }
}

const RELATIONVALUE = 'RELATIONVALUE'
//更新左侧菜单树
function updateTreeLoading(data) {
    return {
        type: UPDATE_TREE_LOADING,
        payload: data
    }
}

//更新右侧content组件内容
function updateContentLoading(data) {
    return {
        type: UPDATE_CONTENT_LOADING,
        payload: data
    }
}

//更新资源列表
function updateResourceInfo(data) {
    return {
        type: UPDATE_RESOURCE_INFO_APPLICATION,
        payload: data
    }
}

//更新资源列表 loading
function updateResourceTableLoading(data) {
    return {
        type: UPDATE_RESOURCE_TABLE_LOADING_APPLICATION,
        payload: data
    }
};

//更新资源列表 pagination
export const updateResourcePagination = (data) => {
    return {
        type: UPDATE_RESOURCE_PAGINATION_APPLICATION,
        payload: data
    }
}

//应用详情（父）
function detailApplicationModule(data) {
    return {
        type: DETAILAPPLICATIONMODULE,
        payload: data
    };
}

//程序详情（子）
function detailProgramModule(data) {
    return {
        type: DETAILPROGRAMMODULE,
        payload: data
    };
}

//自定义属性
function customAttributeModule(data) {
    return {
        type: CUSTOMATTRIBUTEMODULE,
        payload: data
    };
}

//自定义分组
function customGroupModule(data) {
    return {
        type: CUSTOMGROUPMODULE,
        payload: data
    };
}

//自定义分组——用于查询
function searchCustomGroupModule(data) {
    return {
        type: SEARCH_CUSTOM_GROUP_LIST,
        payload: data
    };
}

//变更记录
function recordModule(data) {
    return {
        type: RECORDMODULE,
        payload: data
    };
}

export const selectProgramAction = (sucCb) => {
    let obj = {
        query: ''
    }
    xFetch(`${ContextPath}/cmdb/applications/queryMy`, {
        method: 'post',
        data: JSON.stringify(obj)
    }).then(res => {
        if (res.hasError === false) {
            if (sucCb) {
                sucCb(res.rows);
            }
        } else {
            message.error('查询失败')
        }
    })
        .catch(err => {

        })
}

//查询树结构
export const treeListTypeAction = (id, sucCb) => {
    return dispatch => {
        let systemId = id
        dispatch(updateTreeLoading(true));
        xFetch(`${ContextPath}/cmdb/system/${systemId}/`, {
            method: 'get',
        }).then(res => {
            dispatch(updateTreeLoading(false));
            if (res.hasError === false) {
                if (sucCb) {
                    sucCb(res);
                }
            } else {
                message.error('查询失败')
            }
        })
            .catch(err => {

            })
    }
}

export const programTypeAction = (sucCb) => {
    let obj = {
        name: 'cmdb_program_type'
    }
    xFetch(`${ContextPath}/select/getParam`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: obj
    }).then(res => {
        if (sucCb) {
            sucCb(res);
        }
    })
        .catch(err => {

        })
}

//应用详情
export const detailApplicationAction = (id) => {
    return dispatch => {
        dispatch(updateContentLoading(true));
        xFetch(`${ContextPath}/cmdb/applications/queryMainSystemByCode?systemCode=${id}`, {
            method: 'get',
        }).then(res => {
            dispatch(updateContentLoading(false));
            if (res.hasError === false) {
                dispatch(detailApplicationModule(res.data))
            } else {
                message.error('操作失败')
            }
        })
            .catch(err => {

            })
    }
}

//程序详情
export const detailProgramAction = (systemId, id, sucCb) => {
    return dispatch => {
        xFetch(`${ContextPath}/cmdb/system/${systemId}/program/${id}/detail/`, {
            method: 'get',
        }).then(res => {
            if (res.hasError === false) {
                dispatch(detailProgramModule(res.data))
                if (sucCb) {
                    sucCb(res.data);
                }
            } else {
                message.error('操作失败')
            }
        })
            .catch(err => {

            })
    }
}

//程序编辑
export const editProgramAction = (systemId, id, data, sucCb, ecb) => {
    xFetch(`${ContextPath}/cmdb/system/${systemId}/program/update/${id}/`, {
        method: 'post',
        data: JSON.stringify(data)
    }).then(res => {
        if (res.hasError === false) {
            message.success('编辑成功')
            if (sucCb) {
                sucCb(res.data);
            }
        } else {
            message.error(res.error ? res.error : '编辑失败');
            if (_.isFunction(ecb)) {
                ecb();
            }
        }
    })
        .catch(err => {

        })

}

//删除程序
export const deleteProgramAction = (systemId, id, sucCb) => {
    xFetch(`${ContextPath}/cmdb/system/${systemId}/program/delete/${id}/`, {
        method: 'post',
    }).then(res => {
        if (res.hasError === false) {
            if (sucCb) {
                sucCb(res.data)
            }
            message.success('删除成功')
        } else {
            message.error(res.error ? res.error : '删除失败')
        }
    })
        .catch(err => {

        })

}



//添加应用
export const addApplicationAction = (id, data, sucCb) => {
    const systemId = id
    data.id = 0
    let obj = {
        fixedProperties: data,
        dynamicProperties: []
    }
    xFetch(`${ContextPath}/cmdb/system/${systemId}/program/create/`, {
        method: 'post',
        data: JSON.stringify(obj)
    }).then(res => {
        if (res.hasError === false) {
            message.success('添加成功')
            if (sucCb) {
                sucCb(res.data);
            }
        } else {
            message.error(res.error ? res.error : '添加失败')
        }
    })
        .catch(err => {

        })
}

//克隆程序
export const cloneApplicationProgram = (systemid, id, name, sucCb) => {
    let obj = {
        fixedProperties: [{
            propId: 'name',
            propValue: name
        }]
    }
    xFetch(`${ContextPath}/cmdb/system/${systemid}/program/${id}/clone/`, {
        method: 'post',
        data: JSON.stringify(obj)
    }).then(res => {
        if (res.hasError === false) {
            message.success('克隆成功')
            if (_.isFunction(sucCb)) {
                sucCb(res.data);
            }
        } else {
            message.error(res.error ? res.error : '克隆失败')
        }
    })
        .catch(err => {

        })
}

//查询属性
export const updateAttributeAction = (systemId, sucCb) => {
    return dispatch => {
        xFetch(`${ContextPath}/cmdb/system/${systemId}/customProperties/`, {
            method: 'get',
        }).then(res => {
            if (res.hasError === false) {
                dispatch(customAttributeModule(res.rows))
                if (sucCb) {
                    sucCb(res.rows);
                }
            } else {
                message.error('查询失败')
            }
        })
            .catch(err => {

            })
    }
}

//资源自定义分组
export const editResourceGroupAction = (systemId, id, data, sucCb) => {
    data.systemId = systemId;
    data.id = id;
    return dispatch => {
        xFetch(`${ContextPath}/cmdb/system/${systemId}/program/${id}/resCustCtyEdit/`, {
            method: 'post',
            data: JSON.stringify(data)
        }).then(res => {
            if (res.hasError === false) {
                message.success('修改成功')
                if (sucCb) {
                    sucCb(res.data);
                }
            } else {
                message.error(res.error ? res.error : '修改失败')
            }
        })
            .catch(err => {

            })
    }
}

//查询自定义分组
export const updateGroupAction = (systemId, sucCb) => {
    return dispatch => {
        xFetch(`${ContextPath}/cmdb/system/${systemId}/customCategories/`, {
            // xFetch(`/cmp/cmdb/system/customCategory/`, {
            method: 'get',
        }).then(res => {
            if (res.hasError === false) {
                dispatch(customGroupModule(res.rows));
                let rowsArr = _.cloneDeep(res.rows);
                _.forEach(rowsArr, row => {
                    row.propValue = '';
                })
                dispatch(searchCustomGroupModule(rowsArr));
                if (sucCb) {
                    sucCb(res.rows);
                }
            } else {
                message.error('查询失败')
            }
        })
            .catch(err => {

            })
    }
}

// 新增自定义分组
export const addGroupAction = (systemId, data, sucCb) => {
    data.systemId = systemId
    xFetch(`${ContextPath}/cmdb/system/${systemId}/customCategories/create/`, {
        method: 'post',
        data: JSON.stringify(data)
    }).then(res => {
        if (res.hasError === false) {
            message.success('添加成功')
            if (_.isFunction(sucCb)) {
                sucCb(res.data);
            }
        } else {
            message.error(res.error ? res.error : '添加失败')
        }
    })
        .catch(err => {

        })
};

//修改自定义分组
export const editGroupAction = (systemId, id, data, sucCb) => {
    data.systemId = systemId
    data.id = id
    xFetch(`${ContextPath}/cmdb/system/${systemId}/customCategories/update/${id}/`, {
        method: 'post',
        data: JSON.stringify(data)
    }).then(res => {
        if (res.hasError === false) {
            message.success('修改成功')
            if (_.isFunction(sucCb)) {
                sucCb(res.data);
            }
        } else {
            message.error(res.error ? res.error : '修改失败')
        }
    })
        .catch(err => {

        })
}

//删除自定义分组
export const deleteGroupAction = (systemId, id, sucCb) => {
    xFetch(`${ContextPath}/cmdb/system/${systemId}/customCategories/delete/${id}/`, {
        method: 'post',
    }).then(res => {
        if (res.hasError === false) {
            message.success('删除成功')
            if (_.isFunction(sucCb)) {
                sucCb(res.data);
            }
        } else {
            message.error(res.error ? res.error : '删除失败')
        }
    })
        .catch(err => {

        })
}

//新增属性
export const addAttributeAction = (systemId, data, sucCb) => {
    data.systemId = systemId
    xFetch(`${ContextPath}/cmdb/system/${systemId}/customProperties/create/`, {
        method: 'post',
        data: JSON.stringify(data)
    }).then(res => {
        if (res.hasError === false) {
            message.success('添加成功')
            if (sucCb) {
                sucCb(res.data);
            }
        } else {
            message.error(res.error ? res.error : '添加失败')
        }
    })
        .catch(err => {

        })
}

//修改属性
export const editAttributeAction = (systemId, id, data, sucCb) => {
    data.systemId = systemId
    data.id = id
    xFetch(`${ContextPath}/cmdb/system/${systemId}/customProperties/update/${id}/`, {
        method: 'post',
        data: JSON.stringify(data)
    }).then(res => {
        if (res.hasError === false) {
            message.success('修改成功')
            if (sucCb) {
                sucCb(res.data);
            }
        } else {
            message.error(res.error ? res.error : '修改失败')
        }
    })
        .catch(err => {

        })
}

//删除属性
export const deleteAttributeAction = (systemId, id, sucCb) => {
    xFetch(`${ContextPath}/cmdb/system/${systemId}/customProperties/delete/${id}/`, {
        method: 'post',
    }).then(res => {
        if (res.hasError === false) {
            message.success('删除成功')
            if (sucCb) {
                sucCb(res.data);
            }
        } else {
            message.error(res.error ? res.error : '删除失败')
        }
    })
        .catch(err => {

        })
}

//变更记录
export const updateRecordAction = (systemId, id, sucCb) => {
    return dispatch => {
        xFetch(`${ContextPath}/cmdb/system/${systemId}/program/${id}/changeList/`, {
            method: 'get',
        }).then(res => {
            if (res.hasError === false) {
                dispatch(recordModule(res.rows))
                if (sucCb) {
                    sucCb(res.rows);
                }
            } else {
                message.error('查询失败')
            }
        })
            .catch(err => {

            })
    }
}

//获取资源列表
export const getResourceList = (data, systemid, id, scb, ecb) => {
    return dispatch => {
        dispatch(updateResourceTableLoading(true));
        xFetch(`${ContextPath}/cmdb/system/${systemid}/program/${id}/resources`, {
            method: 'post',
            data: JSON.stringify(data),
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
        }).then((result) => {
            dispatch(updateResourceTableLoading(false));
            if (result.hasError === true) {
                if (_.isFunction(ecb)) {
                    ecb();
                }
            } else {
                if (_.isFunction(scb)) {
                    scb(result);
                }
                dispatch(updateResourceInfo(result));
            }
        })
    }
}

// 删除资源
export const deleteResource = (data, systemid, id, scb, ecb) => {//resource页面传来的data是sequenceId
    return dispatch => {
        xFetch(`${ContextPath}/cmdb/system/${systemid}/program/${id}/resources/delete`, {
            method: 'get',
            data: data,
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((result) => {
            if (result.hasError === true) {
                //   dispatch(updateResourceInfo(false));
                if (_.isFunction(ecb)) {
                    ecb(result.error);
                }
            } else {
                if (_.isFunction(scb)) {
                    scb(result);
                }
            }
        })
    }
};

// 关联资源
export const bindResource = (data, systemid, id, scb, ecb) => {//resource页面传来的data是sequenceId
    return dispatch => {
        xFetch(`${ContextPath}/cmdb/system/${systemid}/program/${id}/bindResources/`, {
            method: 'get',
            data: data,
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((result) => {
            if (result.hasError === true) {
                //   dispatch(updateResourceInfo(false));
                if (_.isFunction(ecb)) {
                    ecb(result.error);
                }
            } else {
                if (_.isFunction(scb)) {
                    scb(result);
                }
            }
        })
    }
};



// IP模糊查询
export function querySystemIp(data, scb, ecb) {
    return dispatch => {
        xFetch(querySystemIpUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result) => {
            if (result.hasError === true) {
                if (_.isFunction(ecb)) {
                    ecb(result);
                }
            } else {
                if (_.isFunction(scb)) {
                    scb(result);
                }
            }
        })
    }
};
// 获取IP维度信息
function updateIpDimensionsDetails(data) {
    return {
        type: UPDATE_IP_DIMENSIONS_DETAILS,
        payload: data
    }
}
function updateIpDimensionsDetailsLoading(data) {
    return {
        type: UPDATE_IP_DIMENSIONS_DETAILS_LOADING,
        payload: data
    }
}
export function getIpDimensionsDetails(data, scb, ecb) {
    return dispatch => {
        dispatch(updateIpDimensionsDetailsLoading({ tableLoading: true }));
        xFetch(queryIpBasicInfoUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result) => {
            dispatch(updateIpDimensionsDetailsLoading({ tableLoading: false }));
            if (result.hasError === true) {
                if (_.isFunction(ecb)) {
                    ecb(result);
                }
            } else {
                let { data = {} } = result;
                if (_.isFunction(scb)) {
                    scb(result);
                }
                dispatch(updateIpDimensionsDetails(data));
            }
        })
    }
};
// 获取IP维度信息
function updateIpDimensionsDetailsOther(data) {
    return {
        type: UPDATE_IP_DIMENSIONS_DETAILS_OTHER,
        payload: data
    }
}
export function getIpDimensionsDetailsOther(data, scb, ecb) {
    return dispatch => {
        xFetch(queryIpCategoryInfoUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result) => {
            if (result.hasError === true) {
                if (_.isFunction(ecb)) {
                    ecb(result);
                }
            } else {
                if (_.isFunction(scb)) {
                    scb(result);
                }
                dispatch(updateIpDimensionsDetailsOther(result.rows));
            }
        })
    }
};

// 获取IP维度信息关联列表
function updateIpDimensionsRelation(data) {
    return {
        type: UPDATE_IP_DIMENSIONS_RELATION,
        payload: data
    }
}
function updateIpDimensionsRelationPagination(data) {
    return {
        type: UPDATE_IP_DIMENSIONS_RELATION_PAGINATION,
        payload: data
    }
}
function updateIpDimensionsRelationLoading(data) {
    return {
        type: UPDATE_IP_DIMENSIONS_RELATION_LOADING,
        payload: data
    }
}
export function getIpDimensionsRelation(data, scb, ecb) {
    return dispatch => {
        dispatch(updateIpDimensionsRelationLoading({ tableLoading: true }));
        dispatch(updateIpDimensionsRelationPagination(data));
        xFetch(queryIpProgramInfoUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result) => {
            dispatch(updateIpDimensionsRelationLoading({ tableLoading: false }));
            if (result.hasError === true) {
                if (_.isFunction(ecb)) {
                    ecb();
                }
            } else {
                let rows = result.rows || []
                rows.forEach(item => {
                    item.id = item.programDto.id;
                    item.parentId = item.programDto.parentId;
                    item.name = item.programDto.name;
                    item.type = item.programDto.type;
                    item.path = item.programDto.path;
                    item.account = item.programDto.account;
                    item.port = item.programDto.port;
                    item.description = item.programDto.description;
                    item.remark = item.programDto.remark;
                });
                result.rows = rows
                if (_.isFunction(scb)) {
                    scb(result);
                }
                dispatch(updateIpDimensionsRelation(result));
            }
        })
    }
};


// 获取数据库实例
function updateDatabaseInstance(data) {
    return {
        type: UPDATE_DATABASE_INSTANCE_LIST,
        payload: data
    }
}
function updateDatabaseInstanceLoading(data) {
    return {
        type: UPDATE_DATABASE_INSTANCE_LIST_LOADING,
        payload: data
    }
}
export function getDatabaseInstance(data, scb, ecb) {
    return dispatch => {
        dispatch(updateDatabaseInstanceLoading({ dbInstacceLoading: true }));
        xFetch(queryDbProgramInfoUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result) => {
            dispatch(updateDatabaseInstanceLoading({ dbInstacceLoading: false }));
            if (result.hasError === true) {
                if (_.isFunction(ecb)) {
                    ecb(result);
                }
            } else {
                result.rows.forEach(item => {
                    item.ipList = [];
                    item.ipListLoading = true;
                    item.ipListResults = 0;
                    item.ipListPagination = { limit: 20, pageIndex: 0 };
                });
                dispatch(updateDatabaseInstance(result.rows));
                if (_.isFunction(scb)) {
                    scb(result.rows);
                }
            }
        })
    }
};

// 获取数据库实例ip列表
function updateDatabaseInstanceIpList(data) {
    return {
        type: UPDATE_DATABASE_INSTANCE_IP_LIST,
        payload: data
    }
}
function updateDatabaseInstanceIpListPagination(data) {
    return {
        type: UPDATE_DATABASE_INSTANCE_IP_LIST_PAGINATION,
        payload: data
    }
}
function updateDatabaseInstanceIpListLoading(data) {
    return {
        type: UPDATE_DATABASE_INSTANCE_IP_LIST_LOADING,
        payload: data
    }
}
export function getDatabaseInstanceIpList(data, scb, ecb) {
    return dispatch => {
        const { programId } = data;
        dispatch(updateDatabaseInstanceIpListLoading({ ipListLoading: true, parentId: programId }));
        dispatch(updateDatabaseInstanceIpListPagination(data));
        xFetch(queryProgramIpInfoUrl, {
            method: 'post',
            data: JSON.stringify(data),
        }).then((result) => {
            dispatch(updateDatabaseInstanceIpListLoading({ ipListLoading: false, parentId: programId }));
            if (result.hasError === true) {
                if (_.isFunction(ecb)) {
                    ecb();
                }
            } else {
                if (_.isFunction(scb)) {
                    scb(result);
                }
                result.parentId = programId;
                dispatch(updateDatabaseInstanceIpList(result));
            }
        })
    }
};





// 联动模板属性
export const getModelList = (data, sucCb) => {
    xFetch(`${ContextPath}/cmdbModel/getModelList`, {
        method: 'post',
        data: JSON.stringify(data)
    }).then(res => {
        if (res.hasError === false) {
            if (sucCb) {
                sucCb(res);
            }
        } else {
            message.error('查询失败')
        }
    })
        .catch(err => { })
}

export const createModel = (data, sucCb) => {
    xFetch(`${ContextPath}/cmdbModel/createModel`, {
        method: 'post',
        data: JSON.stringify(data)
    }).then(res => {
        if (res.hasError === false) {
            if (sucCb) {
                sucCb(res);
            }
        } else {
            message.error(res.error || '查询失败')
        }
    })
        .catch(err => { })
}

export const deleteModel = (data, sucCb) => {
    xFetch(`${ContextPath}/cmdbModel/deleteModel`, {
        method: 'post',
        data: JSON.stringify(data)
    }).then(res => {
        if (res.hasError === false) {
            if (sucCb) {
                sucCb(res);
            }
        } else {
            message.error('查询失败')
        }
    })
        .catch(err => { })
}

export const updateModel = (data, sucCb) => {
    xFetch(`${ContextPath}/cmdbModel/updateModel`, {
        method: 'post',
        data: JSON.stringify(data)
    }).then(res => {
        if (res.hasError === false) {
            if (sucCb) {
                sucCb(res);
            }
        } else {
            message.error('查询失败')
        }
    })
        .catch(err => { })
}

//获取 联动属性列表
function relationValue(data) {
    return {
        type: RELATIONVALUE,
        payload: data
    };
}
export const getRelationValue = (data, sucCb) => {
    return dispatch => {
        xFetch(`${ContextPath}/cmdbModel/getRelationValue/`, {
            method: 'post',
            data: JSON.stringify(data)
        }).then(res => {
            if (res.hasError === false) {
                let respones
                dispatch(relationValue(res.rows))
                if (sucCb) {
                    sucCb(res.rows);
                }
            } else {
                message.error('查询失败')
            }
        })
            .catch(err => {

            })
    }
}

//保存关联属性
export const saveRelationValue = (data, sucCb) => {
    xFetch(`${ContextPath}/cmdbModel/saveRelationValue`, {
        method: 'post',
        data: JSON.stringify(data)
    }).then(res => {
        if (res.hasError === false) {
            if (sucCb) {
                sucCb(res);
            }
        } else {
            message.error('保存失败')
        }
    })
        .catch(err => { })
}

//获取属性模板名称
export const getTemplates = (sucCb) => {
    xFetch(`${ContextPath}/cmdbModel/getModelName`, {
        method: 'post',
    }).then(res => {
        if (sucCb) {
            sucCb(res)
        }
    }).catch(err => { })
}
