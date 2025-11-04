import React, { useState } from 'react';
import { useNavigate } from 'react-router';
const API = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

export default function Signin({ onSignin }) {
    const [form, setForm] = useState({ user_id: '', password: ''});
    const [err, setErr] = useState('');
    const nav = useNavigate();

    function onChange(e) { setForm({...form, [e.target.name]: e.target.value}); }

    async function onSubmit(e) {
        e.preventDefault();
        setErr('');
        try {
            const resp = await fetch(`${API}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await resp.json();
            if (!resp.ok){
                throw new Error(data.error || 'Signin failed');
            }
            localStorage.setItem('token', data.token);
            onSignin(data.user);
            nav('/');
        } 
        catch (err) {
            setErr(err.message);
        }
    }

    return (
        <div className="row justify-content-center">
        <div className="col-md-6">
            <h2>Sign In</h2>
            {err && <div className="alert alert-danger">{err}</div>}
            <form onSubmit={onSubmit}>
            <div className="mb-3">
                <label className="form-label">User ID</label>
                <input name="user_id" value={form.user_id} onChange={onChange} className="form-control"/>
            </div>
            <div className="mb-3">
                <label className="form-label">Password</label>
                <input name="password" type="password" value={form.password} onChange={onChange} className="form-control"/>
            </div>
            <button className="btn btn-primary">Sign in</button>
            </form>
        </div>
        </div>
    );
}
