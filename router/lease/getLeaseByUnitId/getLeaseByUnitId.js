const express = require('express');
const router = express.Router();
const getLeaseByUnitIdHandler = require('../../../router_handler/lease/getLeaseByUnitIdHandler');

/**
 * 根据租赁单元ID获取租赁单元详情路由
 * GET /lease/getLeaseByUnitId/:unitId
 */
router.get('/getLeaseByUnitId/:unitId', getLeaseByUnitIdHandler.getLeaseUnitsByUnitId);

module.exports = router;