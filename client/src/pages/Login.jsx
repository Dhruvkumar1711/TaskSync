import React from 'react'
import { StickyNote } from 'lucide-react'
import { Link } from 'react-router-dom'

const Login = () => {
  return (
   <div>
         <div className="bg-amber-100 w-full border-2 border-amber-300 rounded-lg shadow-lg p-8">
            <div>
                <h1 className="text-2xl font-bold text-amber-800"> <StickyNote /> TaskSync </h1>
            </div>
            <div className="text-center mt-4 mb-6">
                <h1 className="text-xl font-semibold text-amber-700">Welcome back</h1>
                <p>Log in to access your board</p>
            </div>
            <form className="login-form">
                <div>
                    <div className="font-semibold text-amber-700">Email</div>
                    <br />
                    <input type="email" 
                    className="border border-amber-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    placeholder="you@example.com"  />
                </div>
                <br />
                <div className="inputs">
                    <div className="font-semibold text-amber-700">Password</div>
                    <br />
                    <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    className="border border-amber-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    placeholder="Enter your password" />
                </div>
                <br />
                <button 
                type="submit" 
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md"
                >Log In
                </button>
            </form>
            <p className="account">Don't have a an account? 
                <Link className="text-amber-500 hover:underline" to="/register">Register here</Link>
            </p>

    </div>
   </div>
  )
}

export default Login