import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { API_BASE } from './api';

// signup function
export default function Signup({ onSignup }) {
    const [form, setForm] = useState({ user_id: '', password: '', name: ''});
    const [err, setErr] = useState('');
    const nav = useNavigate();

    function onChange(e) {
        setForm({...form, [e.target.name]: e.target.value});
    }

    async function onSubmit(e) {
        e.preventDefault();
        setErr('');
        try {
            const resp = await fetch(`${API_BASE}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await resp.json();
            if (!resp.ok) {
                throw new Error(data.error || 'Signup failed');
            }
            localStorage.setItem('token', data.token);
            onSignup(data.user);
            nav('/');
        }
        catch (err) {
            setErr(err.message);
        }
    }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h2>Sign Up</h2>
        {err && <div className="alert alert-danger">{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">User ID</label>
            <input name="user_id" value={form.user_id} onChange={onChange} className="form-control"/>
          </div>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input name="name" value={form.name} onChange={onChange} className="form-control"/>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input name="password" type="password" value={form.password} onChange={onChange} className="form-control"/>
          </div>
          <button className="btn btn-primary">Sign up</button>
        </form>
      </div>
    </div>
  );
}