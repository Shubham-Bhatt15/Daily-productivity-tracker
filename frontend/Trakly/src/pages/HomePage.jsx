import { Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect,useState} from 'react';

import { formatTime } from '../utils/formatTime';

function HomePage() {
    
  
  const [taskSummary, setTaskSummary] = useState(null);
//changes made here
  const [isLoading, setIsLoading] = useState(true);  // 👈 New loading state
  const [error, setError] = useState(null);    

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token){
          setIsLoading(false);
           return;

        }
        
        const res = await axios.get('/api/tasks/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTaskSummary(res.data);
      } catch (err) {
        setError(err.response?.data?.message||'Failed to load summary');
      }finally{
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);




  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-violet-500 text-white">
      <div className="text-center"> {/* <== NEW WRAPPER DIV */}
      <h1 className="text-4xl font-bold mb-2">TRAKLY</h1>
      <p className="mt-2 text-lg">Track your day. Improve your life.</p>
      

              {/* NEW: Added conditional rendering for authenticated users */}
        {taskSummary ? (
          <div className="mt-6 p-4 bg-white/10 rounded-lg max-w-xs">
            <h3 className="font-semibold mb-2">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-2xl font-bold">{taskSummary.completedTasks}</p>
                <p className="text-xs">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{taskSummary.totalTasks}</p>
                <p className="text-xs">Total Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatTime(taskSummary.totalTime)}</p>
                <p className="text-xs">Tracked</p>
              </div>
            </div>
            <Link 
              to="/dashboard" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Continue to Dashboard
            </Link>
          </div>
        ) : isLoading ? (
          <p>Loading...</p>
        ) : (
          <>

      
      <Link 
        to="/login" 
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Get Started
      </Link>

      <Link 
        to="/signup" 
        className="mt-4 text-sm underline hover:text-gray-200 transition"
      >
        Don't have an account? Sign up
      </Link>
      </>
      )}
     {/* NEW: Added error display */}
        {error && (
          <p className="mt-4 text-red-200 text-sm">
            ⚠️ {error}
          </p>
        )}



    </div>
    </div>
  );
}

export default HomePage;
