module.exports.roleVerify = (value) => {

    return (req, res, next) => {
      const { role } = req.user;
      
      if (role === value)
        return next();
      else
        return res.sendStatus(401);
    }
  }