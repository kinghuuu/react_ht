import xFetch from '../../util/xFetch';
import { UPDATE_MENUS_DATA, UPDATE_MENUS_DATA_ALL, UPDATE_ALL_PROJECT } from '../../constants/actionTypes';
import { UPDATE_SIDER_COLLAPSED } from '../../constants/actionTypes';

const url = '/cmp/user/getLoginMenus';  //菜单权限

function updateSiderCollapsed(data) {
    return {
        type: UPDATE_SIDER_COLLAPSED,
        payload: data
    };
}

function updateMenusAction(data) {
    return {
        type: UPDATE_MENUS_DATA,
        payload: data
    };
}

function requestMenusAction(data, callback) {
    // thunkMiddleware给这里dispatch形参进行赋值
    return dispatch => {
        xFetch(url, {
            data: {}
        }).then(result => {
            if (_.isFunction(callback)) {
                callback(result.result);
            }
            // dispatch(updateMenusAction(result.result.data.menus));

            let menus = [
                { name: "模型配置", path: "modelConfig", icon: "iconfont-order-list" },
                { name: "空闲资源池", path: "resource", icon: "iconfont-order-list" },
                { name: "业务模型", path: "business", icon: "iconfont-order-list" },
                { name: "自定义属性管理", path: "selfDefining", icon: "iconfont-order-list" },
                { name: "联动属性", path: "application/template/property", icon: "iconfont-order-list" },
                { name: "拓扑关系", path: "topList", icon: "iconfont-order-list" },
                { name: "监控情况", path: "monitor", icon: "iconfont-order-list" },
                { name: "IP纬度查询", path: "ipDimension", icon: "iconfont-order-list" },
                { name: "维保查询", path: "maintenance", icon: "iconfont-order-list" },
                { name: "拓扑关系查询", path: "topologicalSearch", icon: "iconfont-order-list" },
                { name: "维保视图管理", path: "maintenance", icon: "iconfont-order-list" },
                { name: "维保通知管理", path: "contract", icon: "iconfont-order-list" },
            ]
            dispatch(updateMenusAction(menus));
        });
    };
}

export { updateSiderCollapsed, updateMenusAction, requestMenusAction };