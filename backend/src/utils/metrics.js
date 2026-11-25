import client from 'prom-client';

export const register = new client.Registry();

// Free built-in metrics: CPU, memory, event loop lag, garbage collection
client.collectDefaultMetrics({ register });

// Counts every cache lookup, labeled hit / miss / bypass
export const cacheRequests = new client.Counter({
  name: 'menu_cache_requests_total',
  help: 'Menu cache lookups by result',
  labelNames: ['result'],
  registers: [register],
});

// Measures how long requests take, in seconds
export const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
  registers: [register],
});

// Express middleware that times each request
export const metricsMiddleware = (req, res, next) => {
  if (req.path === '/metrics' || req.path === '/health') return next();

  const stopTimer = httpDuration.startTimer();
  res.on('finish', () => {
    // Use the route pattern (/api/menu/:id), never the raw URL, so labels stay few
    const route = req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched';
    stopTimer({ method: req.method, route, status_code: res.statusCode });
  });
  next();
};
