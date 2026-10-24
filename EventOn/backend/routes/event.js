const express = require('express')
const router = express.Router();
const { getEvents , getEventsById , createEvents , deleteEvents , updateEvents} = require('../controller/eventController')
const { protect , admin} = require('../middleware/authMiddleware')

router.get('/', getEvents)
router.get('/:id',getEventsById)
router.post('/',protect,admin,createEvents)
router.put('/:id',protect,admin,updateEvents)
router.delete('/:id',protect,admin,deleteEvents)

module.exports = router;
