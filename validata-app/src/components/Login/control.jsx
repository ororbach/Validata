"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginDisplay from './display';
import { signInWithSupabase, signUpWithSupabase } from './service';
import { deleteCookie } from '@/lib/cookies';

// This file defines the control component for the login and registration screen.

// This function renders and manages the logic of the login and registration screen.
export default function LoginControl() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    // Clear cookies
    deleteCookie('sb-access-token');
    deleteCookie('user-role');
    deleteCookie('user-status');
  }, []);

  // This function handles submitting the login or registration form to the system.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        // Login
        await signInWithSupabase(email, password);
        setSuccessMessage('Logged in successfully!');
        
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);

      } else {
        // Register
        await signUpWithSupabase(email, password);
        setSuccessMessage('Registration successful! Please check your email for confirmation, then log in. (Your account will require mentor approval before full access)');
        setIsLogin(true);
        setPassword('');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'An error occurred during authentication.');
      setIsLoading(false);
    }
  };

  return (
    <LoginDisplay
      isLogin={isLogin}
      setIsLogin={setIsLogin}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      isLoading={isLoading}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
      successMessage={successMessage}
      setSuccessMessage={setSuccessMessage}
      handleSubmit={handleSubmit}
    />
  );
}
