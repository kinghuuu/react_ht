// 以下所有常量必须唯一
// 流程中通用action type
export const UPDATE_FLOW_USER_INFO = 'UPDATE_FLOW_USER_INFO'; // 更新流程中用户基本信息
export const UPDATE_FLOW_BASIC_INFO = 'UPDATE_FLOW_BASIC_INFO'; // 更新流程基本信息
export const UPDATE_APP_SYS_4_PAGE = 'UPDATE_APP_SYS_4_PAGE'; // 更新流程中分页应用系统
export const UPDATE_ALL_APP_SYS_4_PAGE = 'UPDATE_ALL_APP_SYS_4_PAGE';
export const UPDATE_ATTACHMENT_LIST = 'UPDATE_ATTACHMENT_LIST'; // 更新流程中附件列表
export const UPDATE_APPROVE_HISTORY = 'UPDATE_APPROVE_HISTORY'; // 更新流程审批历史步骤
export const UPDATE_REGULAR_OPINION = 'UPDATE_REGULAR_OPINION'; // 更新常用审批意见
export const UPDATE_UP_DUTY_PERSION = 'UPDATE_UP_DUTY_PERSION'; // 更新上级负责人信息
export const UPDATE_INTERNAL_APPROVER = 'UPDATE_INTERNAL_APPROVER'; // 更新内部审核人信息
export const UPDATE_USERS_FOR_PAGE = 'UPDATE_USERS_FOR_PAGE'; // 更新内部审核人列表
export const UPDATE_INTERNAL_APPROVER_INFO = 'UPDATE_INTERNAL_APPROVER_INFO'; // 更新本流程内部审核人信息

// 分配 IP 用到的actionTypes
export const UPDATE_ALLOCATION_IP_IP_CONFIG_LIST = 'UPDATE_ALLOCATION_IP_IP_CONFIG_LIST'; // 更新ip配置列表
export const UPDATE_ALLOCATION_IP_ROUTE_CONFIG_LIST = 'UPDATE_ALLOCATION_IP_ROUTE_CONFIG_LIST'; // 更新路由配置列表
export const UPDATE_ALLOCATION_IP_ROUTE_AND_IP_CONFIG_LOADING = 'UPDATE_ALLOCATION_IP_ROUTE_AND_IP_CONFIG_LOADING'; // 更新路由配置ip配置Loading这个量数据用的是一个借口
export const UPDATE_ALLOCATION_IP_SEGMENT_LIST = 'UPDATE_ALLOCATION_IP_SEGMENT_LIST'; // 更新网段信息类表
export const UPDATE_ALLOCATION_IP_GENERATE_FROM_IP = 'UPDATE_ALLOCATION_IP_GENERATE_FROM_IP'; // 更新ip配置列表
export const UPDATE_ALLOCATION_IP_LIST_IP_POOL = 'UPDATE_ALLOCATION_IP_LIST_IP_POOL'; // 更新ip配置列表
export const UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LOADING = 'UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LOADING'; // 更新查询id网段、配置信息的loading状态
export const UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LIST = 'UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_LIST'; // 更新查询id网段、配置信息的列表状态
export const UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_PAGINATION = 'UPDATE_ALLOCATION_IP_QUERY_IP_CONFIGS_PAGINATION'; // 更新查询id网段、配置信息的分页
export const UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP = 'UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP'; // 更新ip配置列表
export const UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_ROUTES = 'UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_ROUTES';
export const UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP_LOADING = 'UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP_LOADING'; // 更新ip配置列表
// export const UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP = 'UPDATE_ALLOCATION_IP_FETCH_AVAILABLE_IP'; // 保存前校验IP是否可用
