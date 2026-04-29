const express = require('express');
const router = express.Router();
const deleteLeaseHandler = require('../../../router_handler/lease/deleteLeaseHandler');

/**
 * 删除租赁单元路由
 * DELETE /lease/deleteLease
 */
router.post('/deleteLease', deleteLeaseHandler.deleteLease);

module.exports = router;