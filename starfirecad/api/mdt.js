const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// MDT API routes will be implemented here
// This includes citizen records, vehicle lookups, etc.

module.exports = router;