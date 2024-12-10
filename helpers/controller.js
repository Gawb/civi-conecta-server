const tryCatch = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    req.logger.error(err);

    if (err.isCustomException) {
      return res.status(err.status ?? 400).json({
        ok: false,
        error: err.message,
        type: err.name,
      });
    }

    throw err;
  }
};

const wrapRequests = (requestObj) => {
  return Object.entries(requestObj).reduce((wrapped, entry) => {
    const [key, handler] = entry;
    wrapped[key] = tryCatch(handler);
    return wrapped;
  }, {});
};

module.exports = { tryCatch, wrapRequests };
