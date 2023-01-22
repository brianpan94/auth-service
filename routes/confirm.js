const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth-confirm');
const authorization = new AuthController();
const authCheck = require('../middlewares/authCheck');

router.post('/login', authorization.login);

// router.use(authCheck);
router.post('/verify', authorization.verify);
router.post('/logout', authorization.logout);

module.exports = router;
