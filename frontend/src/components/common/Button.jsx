import React from 'react';
import './Button.scss';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button',
  variant = 'primary',
  className = '' 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;