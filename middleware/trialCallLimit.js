const attempts = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_CALLS_PER_HOUR = 10;

const trialCallLimit = (req, res, next) => {
  const now = Date.now();
  const key = String(req.user.id);
  const recent = (attempts.get(key) || []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_CALLS_PER_HOUR) {
    return res.status(429).json({
      success: false,
      message: "Hourly trial call limit reached. Try again later.",
    });
  }

  recent.push(now);
  attempts.set(key, recent);
  next();
};

module.exports = trialCallLimit;
