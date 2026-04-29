const express = require("express");
const router = express.Router();
const plotHandler = require('../../../router_handler/plot/getPlotById')

// 支持 GET 和 POST 方法
router.get('/getPlotById', plotHandler.getPlotById);
router.post('/getPlotById', plotHandler.getPlotById);

module.exports = router;