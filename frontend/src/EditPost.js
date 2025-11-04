import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { API_BASE, authFetch } from './api';

export default function EditPost({ user }) {
    const { id } = useParams();
    const nav = useNavigate();
    const [post, setPost] = useState(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [err, setErr] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const resp = await fetch(`${API_BASE}/posts`);
                const data = await resp.json();
                const p = data.find(x => x.id === id);
                if (!p) { setErr('Post not found'); return; }
                setPost(p);
                setTitle(p.title);
                setBody(p.body);
            } 
            catch (e) {
                setErr('Could not load post');
            }
        }
        load();
    }, [id]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!user) {
            return setErr('Sign in to edit');
        }
        try {
            const resp = await authFetch(`/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ title, body }),
            });
            const data = await resp.json();
            if (!resp.ok) {
                throw new Error(data.error || 'Update failed');
            }
            window.dispatchEvent(new CustomEvent('posts-changed'));
            nav('/');
        } 
        catch (err) {
            setErr(err.message);
        }
    }

    if (err) {
        return <div className="alert alert-danger">{err}</div>;
    }
    if (!post) {
        return <div>Loading...</div>;
    } 

    return (
        <div className="col-md-8">
        <h3>Edit Post</h3>
        <form onSubmit={handleSubmit}>
            <div className="mb-2">
            <input className="form-control" value={title} onChange={e=>setTitle(e.target.value)} required />
            </div>
            <div className="mb-2">
            <textarea className="form-control" value={body} onChange={e=>setBody(e.target.value)} rows={6}></textarea>
            </div>
            <button className="btn btn-primary">Save</button>
        </form>
        </div>
    );
}