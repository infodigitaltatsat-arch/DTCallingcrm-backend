const {afterEach, test} = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {register, login} = require('../controllers/authController');
const {protect} = require('../middleware/authMiddleware');

process.env.JWT_SECRET = 'test-secret-for-auth-tests';

const originalMethods = new Map();

const mockUserMethod = (name, implementation) => {
    if (!originalMethods.has(name)) {
        originalMethods.set(name, Object.getOwnPropertyDescriptor(User, name));
    }
    Object.defineProperty(User, name, {
        configurable: true,
        writable: true,
        value: implementation,
    });
};

afterEach(() => {
    for (const [name, descriptor] of originalMethods) {
        if (descriptor) {
            Object.defineProperty(User, name, descriptor);
        } else {
            delete User[name];
        }
    }
    originalMethods.clear();
});

const createResponse = () => ({
    statusCode: 200,
    body: null,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    },
});

test('registration creates only an agent and returns a token', async () => {
    let createdUser;
    mockUserMethod('findOne', async () => null);
    mockUserMethod('create', async (data) => {
        createdUser = {...data, _id: 'user-123'};
        return {...createdUser, email: data.email};
    });

    const response = createResponse();
    await register({
        body: {
            name: '  Example User ',
            email: ' USER@example.com ',
            password: 'secret1',
            role: 'admin',
        },
    }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(createdUser.name, 'Example User');
    assert.equal(createdUser.email, 'user@example.com');
    assert.equal(createdUser.role, 'agent');
    assert.equal(jwt.verify(response.body.token, process.env.JWT_SECRET).id, 'user-123');
});

test('registration returns 400 for malformed fields and short passwords', async () => {
    for (const body of [
        null,
        {name: 'User', email: 'not-an-email', password: 'secret1'},
        {name: 'User', email: 'user@example.com', password: 'short'},
    ]) {
        const response = createResponse();
        await register({body}, response);
        assert.equal(response.statusCode, 400);
    }
});

test('user schema requires name, email, and password', async () => {
    const validationError = await new User({}).validate().catch((error) => error);

    assert.ok(validationError);
    for (const field of ['name', 'email', 'password']) {
        assert.ok(validationError.errors[field], `${field} should be required`);
    }
});

test('login returns a usable token', async () => {
    const passwordHash = await bcrypt.hash('secret1', 10);
    const user = {
        _id: 'user-456',
        name: 'Example User',
        email: 'user@example.com',
        role: 'agent',
        isActive: true,
        password: passwordHash,
    };
    mockUserMethod('findOne', () => ({
        select: async () => user,
    }));

    const response = createResponse();
    await login({body: {email: user.email, password: 'secret1'}}, response);

    assert.equal(response.statusCode, 200);
    assert.equal(jwt.verify(response.body.token, process.env.JWT_SECRET).id, user._id);
});

test('protection allows active users and rejects inactive users', async () => {
    const token = jwt.sign({id: 'user-789'}, process.env.JWT_SECRET);
    mockUserMethod('findById', async () => ({
        _id: 'user-789',
        name: 'Active User',
        email: 'active@example.com',
        role: 'agent',
        isActive: true,
    }));

    const activeResponse = createResponse();
    let nextCalled = false;
    await protect(
        {headers: {authorization: `Bearer ${token}`}},
        activeResponse,
        () => { nextCalled = true; },
    );
    assert.equal(nextCalled, true);
    assert.equal(activeResponse.statusCode, 200);

    mockUserMethod('findById', async () => ({
        _id: 'user-789',
        isActive: false,
    }));
    const inactiveResponse = createResponse();
    await protect(
        {headers: {authorization: `Bearer ${token}`}},
        inactiveResponse,
        () => assert.fail('Inactive user must not be authorized'),
    );
    assert.equal(inactiveResponse.statusCode, 401);
});
