const express = require("express");
const router = express.Router();
const plotHandler = require('../../../router_handler/plot/getPloatInfo')

router.post('/getAllPlotInfo',plotHandler.getALLPloatInfo)


module.exports = router;
