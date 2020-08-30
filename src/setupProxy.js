const proxyMiddleWare = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        proxyMiddleWare('/cmp', {
            target: 'http://168.61.70.118:3000/mock/84',
            changeOrigin: true
        })
    );
    app.use(
        // proxyMiddleWare('/itimp/cmdb/rest', { // 链接到测试环境(168.61.70.225)用这个
        // proxyMiddleWare('/itimp/cmdb/rest/cmdb/rest', { // 链接到IT工作台(168.61.73.198)用这个
        proxyMiddleWare('/cmdb/rest', { // 开发联调用这个
            // target: "http://168.61.45.52:8080", 
            // target: "http://168.61.73.198:8888",
            // target: "http://168.61.70.225:8080", // 测试环境
            // target: "http://168.61.70.225:18008", // 王昂之
            target: "http://168.61.70.225:18017", // 张鹤
            changeOrigin: true,
        })
    );
    // app.use(/portalweb\/portal2\/rest\/(?!act)+/, proxyMiddleWar e(proxyOption));
};