// Set test environment
process.env.NODE_ENV = 'test';

// Configure test MongoDB URI - use the local MongoDB we just set up
process.env.MONGODB_URI = 'mongodb://localhost:27017/furniture-store-test';

// Mock AWS credentials for testing
process.env.AWS_ACCESS_KEY_ID = 'test-key-id';
process.env.AWS_SECRET_ACCESS_KEY = 'test-access-key';
process.env.AWS_BUCKET_NAME = 'test-bucket';
process.env.AWS_REGION = 'us-east-1';

// Mock JWT Secret
process.env.JWT_SECRET = 'test-jwt-secret';

// Mock Stripe keys for testing
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock'; 