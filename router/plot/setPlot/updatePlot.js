const express = require('express');
const router = express.Router();
const updatePlotHandler = require('../../../router_handler/plot/updatePlotHandler');

/**
 * 更新地块路由
 * PUT /plot/updatePlot
 */
router.put('/updatePlot', updatePlotHandler.updatePlot);

module.exports = router;