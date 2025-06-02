import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

interface AuthPageProps {
  onSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToSignup = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <>
      {isLogin ? (
        <Login onSuccess={onSuccess} onSwitchToSignup={switchToSignup} />
      ) : (
        <Signup onSuccess={onSuccess} onSwitchToLogin={switchToLogin} />
      )}
    </>
  );
};

export default AuthPage;
