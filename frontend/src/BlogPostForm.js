import React, { useState } from 'react';
import { authFetch } from './api';

export default function BlogPostForm({ user }) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [msg, setMsg] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        if (!user) {
            return setMsg('You must be signed in to create posts.');
        }
        setMsg('');
        try {
            const resp = await authFetch('/posts', {
                method: 'POST',
                body: JSON.stringify({ title, body }),
            });
            const data = await resp.json();
            if (!resp.ok) {
                throw new Error(data.error || 'Could not create post');
            }
            
            setTitle(''); setBody('');
            setMsg('Post created');

            window.dispatchEvent(new CustomEvent('posts-changed'));
        } 
        catch (err) {
            setMsg(err.message);
        }
    }

    return (
        <div className="card mb-3">
        <div className="card-body">
            <h5>Create a Post</h5>
            {msg && <div className="mb-2">{msg}</div>}
            <form onSubmit={handleSubmit}>
            <div className="mb-2">
                <input className="form-control" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required/>
            </div>
            <div className="mb-2">
                <textarea className="form-control" placeholder="Write your post..." value={body} onChange={e=>setBody(e.target.value)} rows={4}/>
            </div>
            <button className="btn btn-primary" type="submit">Post</button>
            </form>
        </div>
        </div>
    );
}
