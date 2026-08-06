import { StickyNote } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const Register = () => {
  return (
    <div>
            <div className="bg-amber-100 w-full border-2 border-amber-300 rounded-lg shadow-lg p-8">
                <div>
                    <h1 className="text-2xl font-bold text-amber-800"> <StickyNote /> TaskSync</h1>
                </div>
                <div className="welcome">
                    <h1 className="text-xl font-semibold text-amber-700">Create your account</h1>
                    <p className="text-amber-600">Free forever—no credit needed</p>
                </div>
                <form id="registrationForm">
                    <div className="inputs">
                        <div className="font-semibold text-amber-700">Username</div>
                        <br />
                        <input type="text" 
                        id="username"
                        name="username"
                        className="border border-amber-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                        placeholder="e.g. Alex" />
                    </div>
                    <div className="inputs">
                        <div className="font-semibold text-amber-700">Email</div>
                        <br />
                        <input type="email" 
                        id="email"
                        name="email"
                        className="border border-amber-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                        placeholder="you@example.com" />
                    </div>
                    <br />
                    <div className="inputs">
                        <div className="font-semibold text-amber-700">Password</div>
                        <br />
                        <input type="password" 
                        id="password"
                        name="password"
                        className="border border-amber-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="At Least 6 Character" />
                    </div>
                    <br />
                    <button type="submit" 
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md"
                    >
                    Create Account
                    </button>
                </form>
                <p className="account">Already have a an account? 
                    <Link className="text-amber-500 hover:underline" to="/">log in</Link>
                </p>
        </div>
    </div>
  )
}

export default Register