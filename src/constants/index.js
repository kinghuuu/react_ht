export const ContextPath = window.location.href.startsWith('http://localhost') ? '/cmdb/rest' : `/portalweb/cmdb/rest`;
export const DownloadFileUrl = ContextPath + '/download';