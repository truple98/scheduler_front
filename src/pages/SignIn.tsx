import { Link } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'

const SignIn = () => {
  const handleGoogleLogin = () => {
    console.log('Sign in with Google')
    // TODO: Implement Google OAuth
  }

  return (
    <div className="auth-container flex justify-center items-center min-h-screen bg-gray-100">
      <div className="auth-card bg-white px-12 py-12 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="auth-title text-3xl font-bold text-gray-800 mb-8 m-0">Sign In</h2>

        <button
          onClick={handleGoogleLogin}
          className="google-login-btn flex items-center justify-center gap-3 w-full px-6 py-3.5 bg-white border-2 border-gray-300 rounded-lg text-base font-medium text-gray-800 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
        >
          <FcGoogle className="google-icon text-2xl" />
          <span>Continue with Google</span>
        </button>

        <p className="auth-toggle mt-6 text-sm text-gray-600 m-0">
          Don't have an account?{' '}
          <Link to="/sign-up" className="auth-link text-blue-600 font-medium no-underline hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignIn
