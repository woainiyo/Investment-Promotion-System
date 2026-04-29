const createLease = require('./setLease/createLease');
const getLease = require('./getLease/getLease');
const deleteLease = require('./deleteLease/deleteLease');
const updateLease = require('./setLease/updateLease');
const getLeaseByUnitId = require('./getLeaseByUnitId/getLeaseByUnitId');

const express = require('express');
const router = express.Router();

router.use(createLease);
router.use(getLease);
router.use(deleteLease);
router.use(updateLease);
router.use(getLeaseByUnitId);

module.exports = router;