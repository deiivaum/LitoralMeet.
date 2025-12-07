const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("A variável DATABASE_URL não está definida no arquivo .env.");
}

// Configura o adaptador uma única vez
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({
    adapter: adapter,
});

module.exports = prisma;