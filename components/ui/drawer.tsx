import * as React from "react";
import {
  View,
  Pressable,
  Modal,
  useWindowDimensions,
  Platform,
  ScrollView,
} from "react-native";
import { cn } from "./utils/cn";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { SafeAreaView } from "./safe-area-view";

interface DrawerContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: "left" | "right";
}

const DrawerContext = React.createContext<DrawerContextType>({
  open: false,
  onOpenChange: () => {},
  side: "left",
});

interface DrawerProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "left" | "right";
}

const Drawer = ({
  children,
  open = false,
  onOpenChange = () => {},
  side = "left",
}: DrawerProps) => {
  return (
    <DrawerContext.Provider value={{ open, onOpenChange, side }}>
      {children}
    </DrawerContext.Provider>
  );
};

const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  React.ComponentPropsWithoutRef<typeof Pressable> & {
    asChild?: boolean;
  }
>(({ onPress, asChild, children, className, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DrawerContext);

  if (asChild && React.isValidElement(children)) {
    const childProps = (children.props as any) || {};
    return React.cloneElement(children, {
      ...childProps,
      onPress: (e: any) => {
        childProps?.onPress?.(e);
        onPress?.(e);
        onOpenChange(true);
      },
    } as any);
  }

  return (
    <Pressable
      ref={ref}
      className={cn(
        "p-2 rounded-md bg-card border border-border active:bg-accent",
        className,
      )}
      onPress={(e) => {
        onPress?.(e);
        onOpenChange(true);
      }}
      {...props}
    >
      {children || (
        <HugeiconsIcon
          icon={Menu01Icon}
          size={24}
          className="text-card-foreground"
        />
      )}
    </Pressable>
  );
});
DrawerTrigger.displayName = "DrawerTrigger";

interface DrawerContentProps extends React.ComponentPropsWithoutRef<
  typeof View
> {
  children: React.ReactNode;
  className?: string;
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof View>,
  DrawerContentProps
>(({ children, className, ...props }, ref) => {
  const { open, onOpenChange, side } = React.useContext(DrawerContext);
  const { width: screenWidth } = useWindowDimensions();

  // Use fallback width if not available
  const width = screenWidth > 0 ? screenWidth : 393;
  const drawerWidth = Math.min(width * 0.8, 320);

  return (
    <Modal
      visible={open}
      transparent
      animationType={side === "left" ? "slide" : "slide"}
      statusBarTranslucent
      onRequestClose={() => onOpenChange(false)}
    >
      <View className="flex-1 flex-row">
        {/* Backdrop */}
        <Pressable
          className="absolute inset-0 bg-foreground/50"
          onPress={() => onOpenChange(false)}
        />

        {/* Drawer */}
        <View
          style={{
            width: drawerWidth,
            position: "absolute",
            height: "100%",
            [side]: 0,
          }}
        >
          <SafeAreaView
            ref={ref}
            edges={["top", "bottom"]}
            className={cn(
              "flex-1 bg-background",
              Platform.select({
                ios: "shadow-lg shadow-foreground/25",
                android: "elevation-16",
              }),
              className,
            )}
            {...props}
          >
            <ScrollView className="flex-1">{children}</ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
});
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, children, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DrawerContext);

  return (
    <View
      ref={ref}
      className={cn(
        "flex-row items-center justify-between p-4 border-b border-border",
        className,
      )}
      {...props}
    >
      <View className="flex-1">{children}</View>
      <Pressable onPress={() => onOpenChange(false)} className="p-2 ml-2">
        <HugeiconsIcon
          icon={Cancel01Icon}
          size={20}
          className="text-foreground"
        />
      </Pressable>
    </View>
  );
});
DrawerHeader.displayName = "DrawerHeader";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

const DrawerItem = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  React.ComponentPropsWithoutRef<typeof Pressable> & {
    icon?: React.ReactNode;
  }
>(({ className, icon, children, onPress, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DrawerContext);

  return (
    <Pressable
      ref={ref}
      className={cn(
        "flex-row items-center px-4 py-3 active:bg-muted",
        className,
      )}
      onPress={(e) => {
        onPress?.(e);
        onOpenChange(false);
      }}
      {...props}
    >
      {icon && <View className="w-8">{icon}</View>}
      {typeof children === "function"
        ? (children as any)({ pressed: false })
        : children}
    </Pressable>
  );
});
DrawerItem.displayName = "DrawerItem";

const DrawerSeparator = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("h-[1px] bg-border my-2", className)}
    {...props}
  />
));
DrawerSeparator.displayName = "DrawerSeparator";

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerItem,
  DrawerSeparator,
};
