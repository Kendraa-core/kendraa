import React from 'react';
import { useFollowStatus } from '@/hooks/useFollowStatus';
import { 
  CheckIcon, 
  PlusIcon, 
  UserPlusIcon, 
  ClockIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';

interface FollowButtonProps {
  targetUserId: string;
  targetUserType: 'individual' | 'institution';
  currentUserType: 'individual' | 'institution';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  disabled?: boolean;
}

const iconMap = {
  CheckIcon,
  PlusIcon,
  UserPlusIcon,
  ClockIcon,
  XCircleIcon
};

export default function FollowButton({
  targetUserId,
  targetUserType,
  currentUserType,
  className = '',
  size = 'md',
  showIcon = true,
  disabled = false
}: FollowButtonProps) {
  const {
    status,
    actionLoading,
    actionType,
    canSendRequests,
    handleAction,
    getButtonProps
  } = useFollowStatus({
    targetUserId,
    targetUserType,
    currentUserType
  });

  const buttonProps = getButtonProps();
  const IconComponent = iconMap[buttonProps.icon as keyof typeof iconMap];

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  // Handle disabled state
  const isDisabled = disabled || buttonProps.disabled || actionLoading;

  // Handle click
  const handleClick = () => {
    if (!isDisabled) {
      handleAction();
    }
  };

  // Special case for institutions that can't send requests
  if (!canSendRequests && actionType === 'connect') {
    return (
      <div className={`${sizeClasses[size]} ${className} inline-flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold border border-gray-200 w-full`}>
        <XCircleIcon className="w-4 h-4 mr-2" />
        Institutions Cannot Send Requests
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`${buttonProps.className} ${sizeClasses[size]} ${className} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {showIcon && IconComponent && (
        <IconComponent className={`w-4 h-4 mr-2 ${!isDisabled ? 'group-hover:scale-110 transition-transform duration-200' : ''}`} />
      )}
      {actionLoading ? 'Loading...' : buttonProps.text}
    </button>
  );
}
