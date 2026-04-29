const express = require('express');
const router = express.Router();
const createLeaseHandler = require('../../../router_handler/plot/createLeaseHandler');

/**
 * 创建租赁单元路由
 * POST /plot/lease/createLease
 */
router.post('/createLease', createLeaseHandler.createLease);

module.exports = router;