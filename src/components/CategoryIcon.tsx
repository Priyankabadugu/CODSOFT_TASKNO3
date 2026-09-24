import React from 'react';
import {
  Briefcase,
  Car,
  Coins,
  CreditCard,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  MoreHorizontal,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  TrendingUp,
  Utensils,
  Zap,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = '', size = 18 }) => {
  const iconProps = { size, className };

  switch (name) {
    case 'Home':
      return <Home {...iconProps} />;
    case 'ShoppingCart':
      return <ShoppingCart {...iconProps} />;
    case 'Utensils':
      return <Utensils {...iconProps} />;
    case 'Car':
      return <Car {...iconProps} />;
    case 'Zap':
      return <Zap {...iconProps} />;
    case 'Film':
      return <Film {...iconProps} />;
    case 'ShoppingBag':
      return <ShoppingBag {...iconProps} />;
    case 'HeartPulse':
      return <HeartPulse {...iconProps} />;
    case 'Plane':
      return <Plane {...iconProps} />;
    case 'GraduationCap':
      return <GraduationCap {...iconProps} />;
    case 'Briefcase':
      return <Briefcase {...iconProps} />;
    case 'Laptop':
      return <Laptop {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'Store':
      return <Store {...iconProps} />;
    case 'Gift':
      return <Gift {...iconProps} />;
    case 'Coins':
      return <Coins {...iconProps} />;
    case 'CreditCard':
      return <CreditCard {...iconProps} />;
    case 'MoreHorizontal':
    default:
      return <Tag {...iconProps} />;
  }
};
