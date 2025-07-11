  import { useState } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import axios from 'axios'; //add
  import { useEffect } from 'react';


  function Signup() {
    const [formData, setFormData] = useState({
      name: '',
      email: '', // ✅ Added for backend requirements
      password: '' // ✅ Added for backend requirements
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const Urlbackend = "http://localhost:5000"

    
    
    const handleSignup = async (e) => {
      e.preventDefault();
      setError('');

      // ✅ Added validation for all required fields
      if (!formData.name.trim() || !formData.email || !formData.password) {
        setError('All fields are required');
        return;
      }

      try {
        setIsLoading(true);
        
        // ✅ Connect to backend signup endpoint
        const response = await axios.post(`${Urlbackend}/register`, { //previously signup
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        // ✅ Store token and user data (matches Login.jsx flow)
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', response.data.user.name);
        
        navigate('/dashboard');
      } catch (err) {
        console.error('Signup error:', err);
        setError(err.response?.data?.message || 'Signup failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(()=>{
      console.log("data is " , formData)
    })
  const handleChange = (e) => {
      const { name, value , password} = e.target;
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6F8] text-[#333333]">
        <h1 className="text-3xl font-bold mb-6">Create Account</h1>
        <form onSubmit={handleSignup} className="w-80 space-y-4">
          <input
            type="text"
            placeholder="Name"
            name='name'
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
          />
          
        
          {/* ✅ Added email field */}
          <input
            type="email"
            placeholder="Email"
            name='email'
          value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
            required
          />
          {/* ✅ Added password field */}
          <input
            type="password"
            placeholder="Password"
            name='password'
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
            required
            minLength="6"
          />
          
          
          <button type="submit" className="w-full bg-[#009688] text-white p-2 rounded hover:bg-[#00796B]">
            Sign Up
          </button>
        </form>
        
        
        
        <p className="mt-4 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[#3F51B5] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  export default Signup;
