import { useState } from 'react';
import axios from 'axios';

export default function LoginForm() {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      // Redirect to dashboard or home page after successful login
      window.location.href = '/inventory';
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Login user</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="text" placeholder="Email" value={form.email}
          onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="password" type="password" placeholder="Password" value={form.password}
          onChange={handleChange} className="w-full border p-2 rounded" required />
        <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Login</button>
      </form>
      
      {/* redirect to register page */}
      <p className="mt-4 text-center">
        Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
      </p>
    </div>
  );
}
