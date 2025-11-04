import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { API_BASE, authFetch } from './api';

export default function PostList({ user }) {
    const [posts, setPosts] = useState([]);
    const [err, setErr] = useState('');
    const nav = useNavigate();

    async function load() {
        try {
            const resp = await fetch(`${API_BASE}/posts`);
            const data = await resp.json();
            setPosts(data);
        } 
        catch (err) {
            setErr('Could not load posts');
        }
    }

    useEffect(() => {
        load();
        const onChange = () => load();
        window.addEventListener('posts-changed', onChange);
        return () => window.removeEventListener('posts-changed', onChange);
    }, []);

    async function handleDelete(id) {
        if (!user) {
            return alert('Sign in to delete.');
        }
        if (!window.confirm('Delete this post?')) {
            return;
        }
        try {
            const resp = await authFetch(`/posts/${id}`, { method: 'DELETE' });
            const data = await resp.json();
            if (!resp.ok) {
                throw new Error(data.error || 'Delete failed');
            }
            // refresh
            load();
        } 
        catch (err) {
            alert(err.message);
        }
    }

    return (
        <div>
        <h3>Posts</h3>
        {err && <div className="alert alert-danger">{err}</div>}
        {posts.length === 0 && <div>No posts yet</div>}
        {posts.map(p => (
            <div className="card mb-3" key={p.id}>
            <div className="card-body">
                <h5 className="card-title">{p.title}</h5>
                <h6 className="card-subtitle mb-2">By {p.authorName} — {(new Date(p.createdAt)).toLocaleString()}</h6>
                <p className="card-text">{p.body}</p>
                <div>
                {user && user.id === p.authorId && (
                    <>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>nav(`/edit/${p.id}`)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(p.id)}>Delete</button>
                    </>
                )}
                </div>
            </div>
            </div>
        ))}
        </div>
    );
}