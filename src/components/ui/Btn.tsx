'use client';
import Icon from './Icon';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'navy' | 'ghost' | 'quiet';
  icon?: string;
  iconR?: string;
  size?: 'lg' | 'sm';
}

export default function Btn({ variant = 'ghost', icon, iconR, children, size, className = '', ...p }: BtnProps) {
  return (
    <button className={`btn btn-${variant} ${size === 'lg' ? 'btn-lg' : ''} ${className}`} {...p}>
      {icon && <Icon n={icon} size={16} />}
      {children}
      {iconR && <Icon n={iconR} size={16} />}
    </button>
  );
}
