import * as React from "react";
import { Platform, Linking } from "react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Text } from "./text";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  AlertCircleIcon as AlertCircleSvg,
  Camera01Icon,
  MapPinIcon as MapPinSvg,
  Image01Icon,
  GroupIcon,
  BellIcon as BellSvg,
} from "@hugeicons/core-free-icons";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import * as Contacts from "expo-contacts";
import * as Notifications from "expo-notifications";

export type PermissionType =
  | "camera"
  | "location"
  | "locationForeground"
  | "mediaLibrary"
  | "contacts"
  | "notifications";

type PermissionStatus = "undetermined" | "granted" | "denied";
type PermissionResult = { status: PermissionStatus | string };

interface PermissionInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const permissionInfoMap: Record<PermissionType, PermissionInfo> = {
  camera: {
    title: "Camera Access",
    description: "Allow the app to take photos and record videos",
    icon: (
      <HugeiconsIcon icon={Camera01Icon} size={48} className="text-primary" />
    ),
  },
  location: {
    title: "Location Access",
    description: "Allow the app to access your location",
    icon: <HugeiconsIcon icon={MapPinSvg} size={48} className="text-primary" />,
  },
  locationForeground: {
    title: "Location Access",
    description: "Allow the app to access your location while using the app",
    icon: <HugeiconsIcon icon={MapPinSvg} size={48} className="text-primary" />,
  },
  mediaLibrary: {
    title: "Photo Library Access",
    description: "Allow the app to access your photos and videos",
    icon: (
      <HugeiconsIcon icon={Image01Icon} size={48} className="text-primary" />
    ),
  },
  contacts: {
    title: "Contacts Access",
    description: "Allow the app to access your contacts",
    icon: <HugeiconsIcon icon={GroupIcon} size={48} className="text-primary" />,
  },
  notifications: {
    title: "Notification Access",
    description: "Allow the app to send you notifications",
    icon: <HugeiconsIcon icon={BellSvg} size={48} className="text-primary" />,
  },
};

function getPermissionAsync(permission: PermissionType) {
  if (permission === "location") {
    return Location.getBackgroundPermissionsAsync();
  }
  if (permission === "locationForeground") {
    return Location.getForegroundPermissionsAsync();
  }
  if (permission === "mediaLibrary") {
    return MediaLibrary.getPermissionsAsync();
  }
  if (permission === "contacts") {
    return Contacts.getPermissionsAsync();
  }
  if (permission === "notifications") {
    return Notifications.getPermissionsAsync();
  }

  return null;
}

function requestPermissionAsync(permission: PermissionType) {
  if (permission === "location") {
    return Location.requestBackgroundPermissionsAsync();
  }
  if (permission === "locationForeground") {
    return Location.requestForegroundPermissionsAsync();
  }
  if (permission === "mediaLibrary") {
    return MediaLibrary.requestPermissionsAsync();
  }
  if (permission === "contacts") {
    return Contacts.requestPermissionsAsync();
  }
  if (permission === "notifications") {
    return Notifications.requestPermissionsAsync();
  }

  return null;
}

function normalizePermissionStatus(
  status: PermissionResult["status"],
): PermissionStatus {
  return status === "granted" || status === "denied" ? status : "undetermined";
}

interface PermissionRequesterProps {
  permission: PermissionType;
  children: (props: {
    status: "undetermined" | "granted" | "denied";
    requestPermission: () => Promise<void>;
  }) => React.ReactNode;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export function PermissionRequester({
  permission,
  children,
  onPermissionGranted,
  onPermissionDenied,
}: PermissionRequesterProps) {
  const [status, setStatus] = React.useState<
    "undetermined" | "granted" | "denied"
  >("undetermined");
  const [showDialog, setShowDialog] = React.useState(false);
  const permissionInfo = permissionInfoMap[permission];

  const checkPermission = React.useCallback(async () => {
    try {
      const permissionStatus = await getPermissionAsync(permission);

      if (permissionStatus) {
        setStatus(normalizePermissionStatus(permissionStatus.status));
      }
    } catch (error) {
      console.warn("Unable to check permission:", error);
    }
  }, [permission]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      void checkPermission();
    }, 0);

    return () => clearTimeout(timeout);
  }, [checkPermission]);

  const requestPermission = async () => {
    // On iOS, if denied, we need to open settings
    // On Android, we can try requesting again unless user selected "Don't ask again"
    if (status === "denied" && Platform.OS === "ios") {
      setShowDialog(true);
      return;
    }

    try {
      // For camera, you'll need to use the useCameraPermissions hook in your component
      if (permission === "camera") {
        // For camera, just simulate granted for demo
        // In real app, use useCameraPermissions hook from expo-camera
        setStatus("granted");
        onPermissionGranted?.();
        return;
      }

      const permissionResult = await requestPermissionAsync(permission);

      if (permissionResult) {
        const newStatus = normalizePermissionStatus(permissionResult.status);
        setStatus(newStatus);

        if (newStatus === "granted") {
          onPermissionGranted?.();
        } else if (newStatus === "denied") {
          onPermissionDenied?.();
        }
      }
    } catch (error) {
      console.warn("Unable to request permission:", error);
    }
  };

  const openSettings = () => {
    Linking.openSettings();
    setShowDialog(false);
  };

  return (
    <>
      {children({ status, requestPermission })}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex-row items-center justify-center mb-4">
              <HugeiconsIcon
                icon={AlertCircleSvg}
                size={32}
                className="text-destructive"
              />
            </DialogTitle>
            <DialogTitle>
              <Text variant="h4" className="text-center">
                Permission Required
              </Text>
            </DialogTitle>
            <DialogDescription>
              <Text variant="muted" className="text-center">
                {permissionInfo.title} has been denied. Please enable it in your
                device settings to continue.
              </Text>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              onPress={() => setShowDialog(false)}
              className="flex-1"
            >
              <Text>Cancel</Text>
            </Button>
            <Button onPress={openSettings} className="flex-1">
              <Text>Open Settings</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Convenience hook for permissions
export function usePermission(permission: PermissionType) {
  const [status, setStatus] = React.useState<
    "undetermined" | "granted" | "denied"
  >("undetermined");

  const checkPermission = React.useCallback(async () => {
    try {
      const permissionStatus = await getPermissionAsync(permission);

      if (permissionStatus) {
        setStatus(normalizePermissionStatus(permissionStatus.status));
      }
    } catch (error) {
      console.warn("Unable to check permission:", error);
    }
  }, [permission]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      void checkPermission();
    }, 0);

    return () => clearTimeout(timeout);
  }, [checkPermission]);

  const request = async () => {
    try {
      if (permission === "camera") {
        // For camera, return true for demo
        setStatus("granted");
        return true;
      }

      const permissionResult = await requestPermissionAsync(permission);

      if (permissionResult) {
        const newStatus = normalizePermissionStatus(permissionResult.status);
        setStatus(newStatus);
        return newStatus === "granted";
      }

      return false;
    } catch (error) {
      console.warn("Unable to request permission:", error);
      return false;
    }
  };

  return { status, request, check: checkPermission };
}

// For camera permissions, export a separate hook that uses expo-camera's hook
export { useCameraPermissions } from "expo-camera";
