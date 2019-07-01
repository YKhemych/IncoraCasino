const express = require('express');
const controller = require('../controllers/casino');
const router = express.Router();

// localhost:5000/api/user/:name/casino/all
router.get('/:name/casino/all', controller.getAll);

// localhost:5000/api/user/:name/casino/addPage
router.get('/:name/casino/addPage', controller.addPage);

// localhost:5000/api/user/:name/casino/add
router.post('/:name/casino/add', controller.add);

// localhost:5000/api/user/:name/casino/:casinoName
router.get('/:name/casino/:casinoName/', controller.getOne);

// localhost:5000/api/user/:name/casino/:casinoName/numberOfMachine
router.get('/:name/casino/:casinoName/numberOfMachine', controller.getNumberOfMachine);

// localhost:5000/api/user/:name/casino/:casinoName/allMoney
router.get('/:name/casino/:casinoName/allMoney', controller.getAllMoney);

// localhost:5000/api/user/:name/casino/:casinoName/pickUpMoney
router.get('/:name/casino/:casinoName/pickUpMoney', controller.pickUpMoneyPage);
router.post('/:name/casino/:casinoName/pickUpMoney', controller.pickUpMoney);

// localhost:5000/api/user/:name/casino/:casinoName/putMoney
router.get('/:name/casino/:casinoName/putMoney', controller.putMoneyPage);
router.post('/:name/casino/:casinoName/putMoney', controller.putMoney);

module.exports = router;