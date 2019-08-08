const express = require('express');

// const Marker = require('../models/marker');

const checkAuth = require('../middleware/check-auth');
const MarkerController = require('../controllers/marker');
const router = express.Router();

router.post('/bulkSave', checkAuth, MarkerController.bulkSave );

router.get('', checkAuth, MarkerController.getMarkers);

router.delete('/bulkDelete', checkAuth, MarkerController.bulkDelete);

module.exports = router;
