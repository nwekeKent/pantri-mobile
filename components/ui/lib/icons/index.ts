import React from "react";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  AlertCircle as AlertCircleSvg,
  ArrowUpDown as ArrowUpDownSvg,
  Bell as BellSvg,
  Cancel01Icon as CancelSvg,
  CheckIcon as CheckSvg,
  ChevronDown as ChevronDownSvg,
  ChevronLeft as ChevronLeftSvg,
  ChevronRight as ChevronRightSvg,
  ChevronUp as ChevronUpSvg,
  Home01Icon as HomeSvg,
  Menu01Icon as MenuSvg,
  Refresh01Icon as RefreshSvg,
  Settings01Icon as SettingsSvg,
  UserIcon as UserSvg,
  WifiOff01Icon as WifiOffSvg,
} from "@hugeicons/core-free-icons";

type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

function createIcon(icon: any) {
  const IconComponent = ({ size = 24, color = "currentColor", className }: IconProps) => {
    return React.createElement(HugeiconsIcon, { icon, size, color, className });
  };
  IconComponent.displayName = `Icon(${icon.name || "Unknown"})`;
  return IconComponent;
}

export const AlertCircleIcon = createIcon(AlertCircleSvg);
export const ArrowUpDownIcon = createIcon(ArrowUpDownSvg);
export const BellIcon = createIcon(BellSvg);
export const CheckIcon = createIcon(CheckSvg);
export const ChevronDownIcon = createIcon(ChevronDownSvg);
export const ChevronLeftIcon = createIcon(ChevronLeftSvg);
export const ChevronRightIcon = createIcon(ChevronRightSvg);
export const ChevronUpIcon = createIcon(ChevronUpSvg);
export const HomeIcon = createIcon(HomeSvg);
export const MenuIcon = createIcon(MenuSvg);
export const RefreshCwIcon = createIcon(RefreshSvg);
export const SettingsIcon = createIcon(SettingsSvg);
export const UserIcon = createIcon(UserSvg);
export const WifiOffIcon = createIcon(WifiOffSvg);
export const XIcon = createIcon(CancelSvg);
