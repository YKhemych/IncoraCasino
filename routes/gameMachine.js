const express = require('express');
const controller = require('../controllers/gameMachine');
const router = express.Router();


// localhost:5000/api/user/:name/casino/:casinoName/gm/addPage
router.get('/:name/casino/:casinoName/gm/addPage', controller.addPage);

// localhost:5000/api/user/:name/casino/:casinoName/gm/add
router.post('/:name/casino/:casinoName/gm/add', controller.add);

// localhost:5000/api/user/:name/casino/:casinoName/gm/:gmId
router.get('/:name/casino/:casinoName/gm/:gmId', controller.getOne);

// localhost:5000/api/user/:name/casino/:casinoName/gm/:gmId/putMoney
router.post('/:name/casino/:casinoName/gm/:gmId/putMoney', controller.putMoney);

// localhost:5000/api/user/:name/casino/:casinoName/gm/:gmId/pickUpMoney
router.post('/:name/casino/:casinoName/gm/:gmId/pickUpMoney', controller.pickUpMoney);

// localhost:5000/api/user/:name/casino/:casinoName/gm/:gmId/countMoney
router.post('/:name/casino/:casinoName/gm/:gmId/countMoney', controller.countMoney);

// localhost:5000/api/user/:name/casino/:casinoName/gm/:gmId/remove
router.post('/:name/casino/:casinoName/gm/:gmId/remove', controller.remove);

// localhost:5000/api/user/:name/casino/:casinoName/gm/:gmId/play
router.post('/:name/casino/:casinoName/gm/:gmId/play', controller.play);

module.exports = router;