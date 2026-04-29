const express = require('express');
const router = express.Router();
const updateLeaseHandler = require('../../../router_handler/lease/updateLeaseHandler');

/**
 * 更新租赁单元信息路由
 * PUT /lease/setLease/updateLease
 */
router.put('/setLease/updateLease', updateLeaseHandler.updateLease);

module.exports = router;