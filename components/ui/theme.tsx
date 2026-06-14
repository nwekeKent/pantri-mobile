import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "./utils/cn";

const ThemeProvider = React.forwardRef<
  React.ElementRef<typeof View>,
  ViewProps
>(({ className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={cn("flex-1 bg-background", className)}
      {...props}
    />
  );
});

ThemeProvider.displayName = "ThemeProvider";

export { ThemeProvider };
