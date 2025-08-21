function validate(schema) {
  return (req, _res, next) => {
    try {
      if (schema?.parse) {
        schema.parse({
          body: req.body,
          params: req.params,
          query: req.query
        });
      }
      next();
    } catch (err) {
      if (err?.issues) {
        const details = err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message
        }));
        return next({
          status: 400,
          message: 'Validation error',
          details
        });
      }
      next(err);
    }
  };
}

module.exports = { validate };
