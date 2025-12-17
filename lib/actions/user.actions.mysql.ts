"use server";

import { query, queryOne, generateId } from "../database/mysql.config";

// CREATE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    // Check if user already exists
    const existingUser = await queryOne<any>(
      'SELECT * FROM users WHERE email = ?',
      [user.email]
    );

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const userId = generateId();
    await query(
      `INSERT INTO users (id, name, email, phone) VALUES (?, ?, ?, ?)`,
      [userId, user.name, user.email, user.phone]
    );

    const newUser = await queryOne<any>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    return { $id: newUser.id, ...newUser };
  } catch (error) {
    console.error("An error occurred while creating a new user:", error);
    throw error;
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await queryOne<any>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new Error('User not found');
    }

    return { $id: user.id, ...user };
  } catch (error) {
    console.error("An error occurred while retrieving the user details:", error);
    throw error;
  }
};
