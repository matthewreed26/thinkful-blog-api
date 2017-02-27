exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/thinkful-blog-api';
exports.PORT = process.env.PORT || 8080;