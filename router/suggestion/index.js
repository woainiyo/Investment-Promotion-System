const express = require('express');
const router = express.Router();

const suggestionHandler = require('../../router_handler/suggestion/getSuggestionHandler');

/**
 * @module SuggestionRoutes
 * @description 地点搜索推荐路由模块
 * 
 * 路由前缀：/suggestion
 * 
 * 功能说明:
 * - 提供基于关键词的地点搜索推荐功能
 * - 支持按地理位置、区域范围筛选
 * - 调用腾讯地图 WebService API
 * 
 * 所有接口均需要 JWT 认证保护（在 app.js 中统一配置）
 */

// 获取地点搜索推荐
router.post('/getSuggestion', suggestionHandler.getSuggestion);

module.exports = router;
