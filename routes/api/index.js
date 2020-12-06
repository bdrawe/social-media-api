const router = require('express').Router();
const thoughtRoutes = require('./thought-routes');
// const userRoutes = require('./user-routes');

// router.use('/user', userRoutes);
router.use('/thoughts', thoughtRoutes);

module.exports = router;

