import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router';
import Signup from './Signup';
import Signin from './Signin';
import PostList from './PostList';
import BlogPostForm from './BlogPostForm';
import EditPost from './EditPost';

function Nav({ user, onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
      <div className="container">
        <Link className="navbar-brand" to="/">Jack's Blog</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item"><span className="nav-link">Hi, {user.name}</span></li>
                <li className="nav-item"><button className="btn btn-link nav-link" onClick={onLogout}>Logout</button></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/signin">Sign in</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/signup">Sign up</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <Router>
      <Nav user={user} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route path="/" element={
            <>
              <BlogPostForm user={user} />
              <hr />
              <PostList user={user} />
            </>
          } />
          <Route path="/signin" element={<Signin onSignin={setUser} />} />
          <Route path="/signup" element={<Signup onSignup={setUser} />} />
          <Route path="/edit/:id" element={<EditPost user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}