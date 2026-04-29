const express = require('express');
const router = express.Router();
const createPlotHandler = require('../../../router_handler/plot/createPlotHandler');

/**
 * 创建地块路由
 * POST /plot/setPlot/createPlot
 */
router.post('/createPlot', createPlotHandler.createPlot);

module.exports = router;