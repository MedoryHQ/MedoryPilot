import { Action, State, ToasterToast, ToastOptions } from "@/types";
import * as React from "react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        )
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false
              }
            : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function toast({
  title,
  description,
  variant = "default",
  action,
  duration = 5000,
  ...props
}: ToastOptions) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id }
    });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      title,
      description,
      variant,
      action,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });

  if (duration > 0) {
    setTimeout(() => {
      dismiss();
    }, duration);
  }

  return {
    id: id,
    dismiss,
    update
  };
}

const createToastHelpers = (t?: (key: string) => string) => ({
  success: (
    title: string,
    description?: string,
    options?: Partial<ToastOptions>
  ) => toast({ ...options, title, description, variant: "success" }),

  error: (
    title: string,
    description?: string,
    options?: Partial<ToastOptions>
  ) => toast({ ...options, title, description, variant: "destructive" }),

  warning: (
    title: string,
    description?: string,
    options?: Partial<ToastOptions>
  ) => toast({ ...options, title, description, variant: "warning" }),

  info: (
    title: string,
    description?: string,
    options?: Partial<ToastOptions>
  ) => toast({ ...options, title, description, variant: "info" }),

  added: (item: string, description?: string) =>
    toast({
      title: t ? t("toast.added") : "Added Successfully",
      description:
        description ||
        (t
          ? t("toast.operation.successful")
          : `${item} has been added to the system.`),
      variant: "success"
    }),

  updated: (item: string, description?: string) =>
    toast({
      title: t ? t("toast.updated") : "Updated Successfully",
      description:
        description ||
        (t
          ? t("toast.operation.successful")
          : `${item} has been updated successfully.`),
      variant: "success"
    }),

  deleted: (item: string, description?: string) =>
    toast({
      title: t ? t("toast.deleted") : "Deleted Successfully",
      description:
        description ||
        (t
          ? `${item} has been permanently removed.`
          : `${item} has been permanently removed.`),
      variant: "destructive"
    }),

  saved: (item: string, description?: string) =>
    toast({
      title: t ? t("toast.saved") : "Saved Successfully",
      description:
        description ||
        (t
          ? t("toast.settings.saved")
          : "Your changes have been saved successfully."),
      variant: "success"
    }),

  failed: (action: string, description?: string) =>
    toast({
      title: t ? t("toast.failed") : "Operation Failed",
      description:
        description ||
        (t
          ? t("toast.operation.failed")
          : "An error occurred while performing this action."),
      variant: "destructive"
    }),

  loading: (message: string, description?: string) =>
    toast({
      title: message,
      description,
      variant: "info",
      duration: 0
    }),

  patientAdded: (name?: string) =>
    toast({
      title: t ? t("toast.patient.added") : "Patient Added",
      description: name
        ? `${name} has been added to the system.`
        : t
          ? t("toast.operation.successful")
          : "Patient has been added successfully.",
      variant: "success"
    }),

  bookingCreated: (patient?: string) =>
    toast({
      title: t ? t("toast.booking.added") : "Booking Created",
      description: patient
        ? `Appointment scheduled for ${patient}.`
        : t
          ? t("toast.operation.successful")
          : "Booking has been created successfully.",
      variant: "success"
    }),

  bookingCancelled: (patient?: string) =>
    toast({
      title: t ? t("toast.booking.cancelled") : "Booking Cancelled",
      description: patient
        ? `Appointment for ${patient} has been cancelled.`
        : t
          ? "Booking has been cancelled."
          : "Booking has been cancelled.",
      variant: "destructive"
    }),

  dataSync: () =>
    toast({
      title: t ? t("toast.data.synced") : "Data Synchronized",
      description: t
        ? t("toast.operation.successful")
        : "All data has been synchronized successfully.",
      variant: "success"
    }),

  networkError: () =>
    toast({
      title: t ? t("toast.error") : "Network Error",
      description: t
        ? t("toast.network.error")
        : "Please check your internet connection and try again.",
      variant: "destructive"
    }),

  validationError: () =>
    toast({
      title: t ? t("toast.warning") : "Validation Error",
      description: t
        ? t("toast.validation.error")
        : "Please check your input and try again.",
      variant: "warning"
    })
});

const toastHelpers = createToastHelpers();

function useToast(t?: (key: string) => string) {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  const localizedHelpers = React.useMemo(
    () => (t ? createToastHelpers(t) : toastHelpers),
    [t]
  );

  return {
    ...state,
    toast: {
      ...toast,
      ...localizedHelpers
    },
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}

export { useToast, toast };
