const express = require("express");
const app = express();
const cors = require("cors");
const { expressjwt } = require("express-jwt");
const config = require("./config");
const userRouter = require("./router/user/user");
const plotRouter = require("./router/plot/index");
const leaseRouter = require("./router/lease/index");
const chatRouter = require("./router/chat/index");
const suggestionRouter = require("./router/suggestion/index");



// 自定义 res.cc，所有路由和中间件都能用

app.use(function (req, res, next) {
  res.cc = function (err, status = 1) {
    res.send({
      status,
      message: err instanceof Error ? err.message : err,
    });
  };
  next();
});

// 全局中间件
app.use(cors({ 
  origin: '*', // 允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许所有HTTP方法
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // 允许常用请求头
  credentials: false // 不需要发送凭证（如cookies）
})); // 跨域
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 静态资源托管 - 托管 static 目录下的文件
app.use(express.static('static'));

// JWT 认证中间件，排除登录接口、静态资源和特定公开接口
app.use(
  expressjwt({ secret: config.secretKey, algorithms: ["HS256"] }).unless({ 
    path: ["/plot/getAllPlotInfo", "/api/login", "/api/register"] })
);


// 路由
app.use("/api", userRouter);
app.use("/plot", plotRouter);
app.use("/lease", leaseRouter);
app.use("/chat", chatRouter);
app.use("/suggestion", suggestionRouter);




// 全局错误处理中间件
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    console.log("Token身份认证失败！");
    return res.cc("Token身份认证失败！");
  }
  // 其它错误兜底
  return res.cc(err);
});

module.exports = app;