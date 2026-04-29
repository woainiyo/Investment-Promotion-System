const express = require('express');
const router = express.Router();
const getLeaseHandler = require('../../../router_handler/lease/getLeaseHandler');

/**
 * 根据地块ID获取租赁单元列表路由
 * GET /lease/getLease/:plotId
 */
router.get('/getLease/:plotId', getLeaseHandler.getLeaseUnitsByPlotId);

module.exports = router;