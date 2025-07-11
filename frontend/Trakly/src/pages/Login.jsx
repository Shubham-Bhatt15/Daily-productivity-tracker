import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


function Login() {
  const [email, setEmail] = useState(''); // MODIFIED: Changed from 'name' to 'email'
  const [password, setPassword] = useState(''); // NEW: Added password field
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
    try {
      // Backend integration
      const { data } = await axios.post('http://localhost:5000/login', {
        email,
        password
      });
      
      // +++ NEW: Store JWT token +++
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      // +++ NEW: Error handling +++
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6F8] text-[#333333]">
      <h1 className="text-3xl font-bold mb-6">Welcome Back</h1>
      <form onSubmit={handleLogin} className="w-80 space-y-4">
        <input
          type="email"
          placeholder="Enter your name"
          value={email}  //name to email
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded text-black"
        />
        {/* +++ NEW: Added password input +++ */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded text-black"
          required
        />
        
        <button type="submit" className="w-full bg-[#3F51B5] text-white p-2 rounded hover:bg-[#303F9F]">
          Log In
        </button>
      </form>
      <p className="mt-4 text-sm">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[#009688] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default Login;
