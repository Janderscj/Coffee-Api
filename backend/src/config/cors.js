const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

export const corsOptions = {
  origin(origin, callback) {
    // Allow Postman, curl, server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
