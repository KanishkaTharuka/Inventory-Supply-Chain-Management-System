import { useState } from 'react';
import axios from 'axios';

export default function RegisterForm() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="username" type="text" placeholder="Username" value={form.username}
          onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="email" type="email" placeholder="Email" value={form.email}
          onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="password" type="password" placeholder="Password" value={form.password}
          onChange={handleChange} className="w-full border p-2 rounded" required />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Register</button>
      </form>
      {message && <p className="text-center mt-3 text-sm text-green-600">{message}</p>}
      {/* redirect to login page */}
      <p className="mt-4 text-center">
        Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
      </p>
    </div>
  );
}
