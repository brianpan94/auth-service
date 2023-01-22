module.exports = function(req, res, next) {
  const auth = req.get('Authorization');
  if (!auth) {
    res.status(403).send('unauthorized');
  } else {
    next();
  }
};

