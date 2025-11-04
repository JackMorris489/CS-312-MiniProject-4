const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const PORT = process.env.PORT || 8000;

// function to read data from the json
async function readData() {
    try {
        const exists = await fs.pathExists(DATA_FILE);
        if (!exists) {
            const init = { users: [], posts: [] };
            await fs.writeJson(DATA_FILE, init, { spaces: 2 });
            return init;
        }
        return fs.readJson(DATA_FILE);
    } 
    catch (err) {
        console.error('readData error', err);
        return { users: [], posts: [] };
    }
}

// function to write data to the json
async function writeData(data) {
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
}

// function to create the Auth middleware
function createAuthMiddleware() {
    return async (req, res, next) => {
        const auth = req.headers.authorization;
        if (!auth?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing token' });
        }
        const token = auth.slice('Bearer '.length);
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            req.user = payload;
            next();
        } 
        catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
}

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// signup
app.post('/api/signup', async (req, res) => {
    const { user_id, password, name } = req.body;
    if (!user_id || !password || !name) {
        return res.status(400).json({ error: 'user_id, password, name required' });
    }
    const data = await readData();
    const exists = data.users.find(u => u.user_id === user_id);
    if (exists) return res.status(409).json({ error: 'User id already taken' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), user_id, password: hashed, name };
    data.users.push(newUser);
    await writeData(data);

    // create token
    const token = jwt.sign({ userId: newUser.id, userIdName: user_id, name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: newUser.id, user_id, name } });
});

// signin
app.post('/api/signin', async (req, res) => {
    const { user_id, password } = req.body;
    if (!user_id || !password) return res.status(400).json({ error: 'user_id and password required' });

    const data = await readData();
    const user = data.users.find(u => u.user_id === user_id);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, userIdName: user.user_id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, user_id: user.user_id, name: user.name } });
});

// get all posts
app.get('/api/posts', async (req, res) => {
    const data = await readData();

    // return newest first
    const posts = (data.posts || []).slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(posts);
});

// create post if logged in
app.post('/api/posts', createAuthMiddleware(), async (req, res) => {
    const { title, body } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const data = await readData();
    const newPost = {
        id: uuidv4(),
        title,
        body: body || '',
        authorId: req.user.userId,
        authorUserId: req.user.userIdName,
        authorName: req.user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    data.posts.push(newPost);
    await writeData(data);
    res.json(newPost);
});

// edit post if logged in
app.put('/api/posts/:id', createAuthMiddleware(), async (req, res) => {
    const { id } = req.params;
    const { title, body } = req.body;
    const data = await readData();
    const post = data.posts.find(p => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== req.user.userId) return res.status(403).json({ error: 'Not allowed' });

    post.title = title ?? post.title;
    post.body = body ?? post.body;
    post.updatedAt = new Date().toISOString();
    await writeData(data);
    res.json(post);
});

// delete post if logged in
app.delete('/api/posts/:id', createAuthMiddleware(), async (req, res) => {
    const { id } = req.params;
    const data = await readData();
    const idx = data.posts.findIndex(p => p.id === id);

    if (idx === -1) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const post = data.posts[idx];

    if (post.authorId !== req.user.userId) {
        return res.status(403).json({ error: 'Not allowed' });
    }

    data.posts.splice(idx, 1);
    await writeData(data);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
