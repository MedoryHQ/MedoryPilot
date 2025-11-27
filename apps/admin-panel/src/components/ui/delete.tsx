import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import axios from "@/api/axios";
import { toUpperCase } from "@/utils";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: string;
  itemId: string | null;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  titleKey?: string;
  descriptionKey?: string;
  cancelKey?: string;
  deleteKey?: string;
  className?: string;
}

export function DeleteDialog({
  open,
  onOpenChange,
  endpoint,
  itemId,
  onSuccess,
  onError,
  titleKey = "confirmDialog.areYouSure",
  descriptionKey = "confirmDialog.deleteDescription",
  cancelKey = "confirmDialog.cancel",
  deleteKey = "confirmDialog.delete",
  className
}: DeleteDialogProps) {
  const { t } = useTranslation();

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async () => {
      if (!itemId) return;
      await axios.delete(`${endpoint}/${itemId}`);
    },
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{toUpperCase(t(titleKey))}</AlertDialogTitle>
          <AlertDialogDescription>
            {toUpperCase(t(descriptionKey))}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{toUpperCase(t(cancelKey))}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => itemId && mutateAsync()}
            className={
              className ||
              "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            }
            disabled={isLoading}
          >
            {toUpperCase(t(deleteKey))}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteDialog;
