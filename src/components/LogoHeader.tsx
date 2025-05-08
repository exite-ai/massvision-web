import React from 'react';
import '../styles/LogoHeader.css';

interface LogoHeaderProps {
  logoSrc: string;
  children?: React.ReactNode;
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ logoSrc, children }) => {
  return (
    <header className="logo-header simple-header">
      <img src={logoSrc} alt="MASS Vision ロゴ" className="logo-header__img simple-logo" />
      <div className="logo-header__right">{children}</div>
    </header>
  );
};

export default LogoHeader; 