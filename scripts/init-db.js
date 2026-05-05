const Database = require('better-sqlite3');
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    password TEXT,
    credits INTEGER DEFAULT 0,
    role TEXT DEFAULT 'USER',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Campaigns table
  CREATE TABLE IF NOT EXISTS Campaign (
    id TEXT PRIMARY KEY,
    adNumber TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    targetUrl TEXT,
    action TEXT NOT NULL,
    targetedReach INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    whatsappNumber TEXT NOT NULL,
    billAmount INTEGER NOT NULL,
    status TEXT DEFAULT 'PENDING_PAYMENT',
    userId TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id)
  );

  -- Payments table
  CREATE TABLE IF NOT EXISTS Payment (
    id TEXT PRIMARY KEY,
    campaignId TEXT UNIQUE NOT NULL,
    userId TEXT,
    method TEXT NOT NULL,
    amount INTEGER NOT NULL,
    txHash TEXT,
    creditCode TEXT,
    guiderId TEXT,
    status TEXT DEFAULT 'PENDING',
    verifiedAt TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaignId) REFERENCES Campaign(id),
    FOREIGN KEY (userId) REFERENCES User(id),
    FOREIGN KEY (guiderId) REFERENCES Guider(id)
  );

  -- Guiders table
  CREATE TABLE IF NOT EXISTS Guider (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phoneNumber TEXT UNIQUE NOT NULL,
    whatsapp TEXT NOT NULL,
    telegram TEXT,
    avatar TEXT NOT NULL,
    rating REAL DEFAULT 5.0,
    totalTransactions INTEGER DEFAULT 0,
    responseTime TEXT NOT NULL,
    languages TEXT NOT NULL,
    isOnline INTEGER DEFAULT 0,
    isVerified INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- CreditCodes table
  CREATE TABLE IF NOT EXISTS CreditCode (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    guiderId TEXT,
    adNumber TEXT,
    status TEXT DEFAULT 'ACTIVE',
    usedBy TEXT,
    usedAt TEXT,
    expiresAt TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Analytics table
  CREATE TABLE IF NOT EXISTS Analytics (
    id TEXT PRIMARY KEY,
    campaignId TEXT UNIQUE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagement REAL DEFAULT 0,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaignId) REFERENCES Campaign(id)
  );

  -- PaymentConfig table (for USDT wallet address, network, etc.)
  CREATE TABLE IF NOT EXISTS PaymentConfig (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Database tables created successfully!');

// Seed data
const { randomBytes } = require('crypto');

function generateId() {
    return randomBytes(12).toString('hex');
}

// Insert payment config (USDT wallet)
const insertConfig = db.prepare(`
  INSERT OR REPLACE INTO PaymentConfig (id, key, value, description)
  VALUES (?, ?, ?, ?)
`);

insertConfig.run(
    generateId(),
    'usdt_wallet_address',
    'TXYZabc123456789DefGhiJklMnoPqrStuVwx',
    'USDT TRC20 wallet address for receiving payments'
);

insertConfig.run(
    generateId(),
    'usdt_network',
    'TRC20',
    'USDT network chain (TRC20 on TRON blockchain)'
);

console.log('✅ Payment configuration seeded!');

// Seed guiders
const insertGuider = db.prepare(`
  INSERT OR REPLACE INTO Guider (
    id, name, phoneNumber, whatsapp, telegram, avatar, rating,
    totalTransactions, responseTime, languages, isOnline, isVerified
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const guiders = [
    {
        name: 'Sarah Johnson',
        phoneNumber: '+1234567890',
        whatsapp: '+1234567890',
        telegram: '@sarahjohnson',
        avatar: 'https://i.pravatar.cc/150?img=1',
        rating: 4.9,
        totalTransactions: 156,
        responseTime: '< 5 min',
        languages: JSON.stringify(['English', 'Spanish']),
    },
    {
        name: 'Michael Chen',
        phoneNumber: '+1234567891',
        whatsapp: '+1234567891',
        telegram: '@michaelchen',
        avatar: 'https://i.pravatar.cc/150?img=12',
        rating: 4.8,
        totalTransactions: 203,
        responseTime: '< 10 min',
        languages: JSON.stringify(['English', 'Mandarin']),
    },
    {
        name: 'Emma Williams',
        phoneNumber: '+1234567892',
        whatsapp: '+1234567892',
        telegram: '@emmawilliams',
        avatar: 'https://i.pravatar.cc/150?img=5',
        rating: 5.0,
        totalTransactions: 89,
        responseTime: '< 3 min',
        languages: JSON.stringify(['English', 'French']),
    },
    {
        name: 'David Martinez',
        phoneNumber: '+1234567893',
        whatsapp: '+1234567893',
        telegram: null,
        avatar: 'https://i.pravatar.cc/150?img=13',
        rating: 4.7,
        totalTransactions: 134,
        responseTime: '< 15 min',
        languages: JSON.stringify(['English', 'Spanish', 'Portuguese']),
    },
    {
        name: 'Lisa Anderson',
        phoneNumber: '+1234567894',
        whatsapp: '+1234567894',
        telegram: '@lisaanderson',
        avatar: 'https://i.pravatar.cc/150?img=9',
        rating: 4.9,
        totalTransactions: 178,
        responseTime: '< 5 min',
        languages: JSON.stringify(['English']),
    },
    {
        name: 'James Taylor',
        phoneNumber: '+1234567895',
        whatsapp: '+1234567895',
        telegram: '@jamestaylor',
        avatar: 'https://i.pravatar.cc/150?img=14',
        rating: 4.6,
        totalTransactions: 92,
        responseTime: '< 20 min',
        languages: JSON.stringify(['English', 'German']),
    },
];

guiders.forEach((guider) => {
    insertGuider.run(
        generateId(),
        guider.name,
        guider.phoneNumber,
        guider.whatsapp,
        guider.telegram,
        guider.avatar,
        guider.rating,
        guider.totalTransactions,
        guider.responseTime,
        guider.languages,
        Math.random() > 0.5 ? 1 : 0,
        1
    );
});

console.log('✅ Guiders seeded!');

// Seed credit codes
const insertCreditCode = db.prepare(`
  INSERT OR REPLACE INTO CreditCode (id, code, amount, status)
  VALUES (?, ?, ?, ?)
`);

for (let i = 0; i < 10; i++) {
    const code = `CREDIT-${randomBytes(4).toString('hex').toUpperCase()}`;
    insertCreditCode.run(generateId(), code, 50000 + i * 10000, 'ACTIVE');
}

console.log('✅ Credit codes seeded!');

// Create admin user
const insertUser = db.prepare(`
  INSERT OR REPLACE INTO User (id, email, name, phone, password, credits, role)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertUser.run(
    generateId(),
    'admin@paypulse.com',
    'Admin User',
    '+1234567890',
    'admin123', // In production, this should be hashed
    1000000,
    'ADMIN'
);

console.log('✅ Admin user created!');
console.log('\n🎉 Database setup complete!');
console.log('📍 Database location:', dbPath);

db.close();
