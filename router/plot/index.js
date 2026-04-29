const getPlotInfo = require("./getPlot/getPlotInfo");
const getPlotById = require("./getPlot/getPlotById");
const createPlotRouter = require("./setPlot/createPlot");
const updatePlotRouter = require("./setPlot/updatePlot");
const deletePlotRouter = require("./deletePlot");
const createLeaseRouter = require("../lease/setLease/createLease");
const express = require("express");
const router = express.Router();

router.use(getPlotInfo);
router.use(getPlotById);
router.use(createPlotRouter);
router.use(updatePlotRouter);
router.use(deletePlotRouter);
router.use(createLeaseRouter);

module.exports = router;