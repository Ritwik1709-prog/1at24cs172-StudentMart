import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../server/models/User.js'
import { cookieOptions } from '../server/middleware/auth.js'

describe('User Authentication Unit Tests', () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.edu(\.[a-z]{2,})?$/i
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/
  const secretKey = 'test-jwt-secret-key-12345'

  describe('1. Email Field Validation (.edu extension required)', () => {
    it('accepts valid email addresses with .edu extension', () => {
      assert.equal(emailPattern.test('student@university.edu'), true)
      assert.equal(emailPattern.test('1at24cs172@atria.edu'), true)
      assert.equal(emailPattern.test('user@college.edu.in'), true)
    })

    it('rejects email addresses without .edu extension or invalid format', () => {
      assert.equal(emailPattern.test('john.doe@gmail.com'), false)
      assert.equal(emailPattern.test('user_123@sub.domain.org'), false)
      assert.equal(emailPattern.test('plainaddress'), false)
      assert.equal(emailPattern.test('@missingusername.edu'), false)
      assert.equal(emailPattern.test('user@domain'), false)
    })
  })

  describe('2. Password Field Validation', () => {
    it('accepts passwords meeting complexity requirements (8+ chars, upper, lower, digit)', () => {
      assert.equal(passwordPattern.test('Student123'), true)
      assert.equal(passwordPattern.test('A1b2C3d4'), true)
      assert.equal(passwordPattern.test('Passw0rdSecure'), true)
    })

    it('rejects passwords shorter than 8 characters', () => {
      assert.equal(passwordPattern.test('Ab1'), false)
      assert.equal(passwordPattern.test('Pass1'), false)
    })

    it('rejects passwords missing an uppercase letter', () => {
      assert.equal(passwordPattern.test('lowercase123'), false)
    })

    it('rejects passwords missing a lowercase letter', () => {
      assert.equal(passwordPattern.test('UPPERCASE123'), false)
    })

    it('rejects passwords missing a digit', () => {
      assert.equal(passwordPattern.test('NoDigitsHere'), false)
    })
  })

  describe('3. Password Hashing (bcrypt)', () => {
    it('successfully hashes a plaintext password and verifies match', async () => {
      const plaintext = 'SecurePass123'
      const hash = await bcrypt.hash(plaintext, 12)

      assert.notEqual(hash, plaintext)
      assert.equal(typeof hash, 'string')
      assert.equal(hash.startsWith('$2'), true) // standard bcrypt prefix

      const isMatch = await bcrypt.compare(plaintext, hash)
      assert.equal(isMatch, true)
    })

    it('rejects an incorrect password during verification', async () => {
      const plaintext = 'SecurePass123'
      const hash = await bcrypt.hash(plaintext, 12)

      const isMatch = await bcrypt.compare('WrongPassword456', hash)
      assert.equal(isMatch, false)
    })
  })

  describe('4. JWT Session Token Issuance & Verification', () => {
    it('signs and verifies a valid JWT session token', () => {
      const userPayload = {
        id: '672b15fa403c940562e84123',
        email: 'test@student.edu',
        role: 'seller',
      }

      const token = jwt.sign(userPayload, secretKey, {
        subject: userPayload.id,
        expiresIn: '7d',
      })

      assert.equal(typeof token, 'string')

      const decoded = jwt.verify(token, secretKey)
      assert.equal(decoded.sub, userPayload.id)
      assert.equal(decoded.email, userPayload.email)
      assert.equal(decoded.role, userPayload.role)
    })

    it('fails verification with an incorrect secret key', () => {
      const token = jwt.sign({ sub: 'user1' }, secretKey)
      assert.throws(() => {
        jwt.verify(token, 'wrong-secret-key')
      })
    })
  })

  describe('5. Mongoose User Model Schema Validation', () => {
    it('validates a user with valid attributes', () => {
      const user = new User({
        name: 'Riya Sharma',
        email: 'riya.sharma@college.edu',
        password: '$2a$12$e0NRu...mockhash',
        role: 'seller',
      })

      const validationError = user.validateSync()
      assert.equal(validationError, undefined)
      assert.equal(user.email, 'riya.sharma@college.edu')
    })

    it('rejects an invalid name with fewer than 2 characters', () => {
      const user = new User({
        name: 'A',
        email: 'valid@college.edu',
        password: '$2a$12$mockhash',
      })

      const error = user.validateSync()
      assert.ok(error?.errors?.name)
    })

    it('converts email to lowercase and trims input', () => {
      const user = new User({
        name: 'Alex Johnson',
        email: '  ALEX.J@College.EDU  ',
        password: '$2a$12$mockhash',
      })

      assert.equal(user.email, 'alex.j@college.edu')
    })
  })

  describe('6. Logout Cookie Options', () => {
    it('returns secure httpOnly cookie configuration', () => {
      const opts = cookieOptions()
      assert.equal(opts.httpOnly, true)
      assert.equal(opts.sameSite, 'lax')
      assert.equal(opts.path, '/')
      assert.equal(typeof opts.maxAge, 'number')
    })
  })
})

