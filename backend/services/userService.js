const { docClient } = require("../config/dynamodb");
const bcrypt = require("bcryptjs");
const { generateId } = require("../utils/helpers");
const { ROLES } = require("../utils/constants");

class UserService {
  // Create new user
  async createUser(userData) {
    const { name, email, phone, password } = userData;

    // Check if exists
    const existing = await this.getUserByEmail(email);
    if (existing) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = generateId("USER");
    const newUser = {
      userId,
      name,
      email,
      phone,
      password: hashedPassword,
      role: ROLES.CITIZEN,
      noShowCount: 0,
      blockedUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docClient
      .put({
        TableName: process.env.USERS_TABLE,
        Item: newUser,
      })
      .promise();

    return newUser;
  }

  // Get user by email
  async getUserByEmail(email) {
    const result = await docClient
      .query({
        TableName: process.env.USERS_TABLE,
        IndexName: "email-index",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
      .promise();

    return result.Items.length > 0 ? result.Items[0] : null;
  }

  // Get user by ID
  async getUserById(userId) {
    const result = await docClient
      .get({
        TableName: process.env.USERS_TABLE,
        Key: { userId },
      })
      .promise();

    return result.Item || null;
  }

  // Verify password
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Increment no-show count
  async incrementNoShowCount(userId) {
    const user = await this.getUserById(userId);
    if (!user) return;

    const newCount = (user.noShowCount || 0) + 1;
    const maxNoShows = parseInt(process.env.MAX_NO_SHOWS_BEFORE_BLOCK) || 3;
    const blockDurationDays = parseInt(process.env.BLOCK_DURATION_DAYS) || 30;

    let blockedUntil = null;

    if (newCount >= maxNoShows) {
      const blockDate = new Date();
      blockDate.setDate(blockDate.getDate() + blockDurationDays);
      blockedUntil = blockDate.toISOString();
    }

    await docClient
      .update({
        TableName: process.env.USERS_TABLE,
        Key: { userId },
        UpdateExpression:
          "SET noShowCount = :count, blockedUntil = :blockedUntil, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":count": newCount,
          ":blockedUntil": blockedUntil,
          ":updatedAt": new Date().toISOString(),
        },
      })
      .promise();

    return { newCount, blockedUntil };
  }

  // Check if user is blocked
  async isBlocked(userId) {
    const user = await this.getUserById(userId);
    if (!user) return false;

    if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
      return {
        blocked: true,
        blockedUntil: user.blockedUntil,
      };
    }

    return { blocked: false };
  }
}

module.exports = new UserService();
