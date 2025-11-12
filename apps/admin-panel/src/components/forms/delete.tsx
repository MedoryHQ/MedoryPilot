import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../ui";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import axios from "@/api/axios";

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
  titleKey = "heros.areYouSure",
  descriptionKey = "heros.deleteDescription",
  cancelKey = "heros.cancel",
  deleteKey = "heros.delete",
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
          <AlertDialogTitle>{t(titleKey)}</AlertDialogTitle>
          <AlertDialogDescription>{t(descriptionKey)}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t(cancelKey)}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => itemId && mutateAsync()}
            className={
              className ||
              "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            }
            disabled={isLoading}
          >
            {t(deleteKey)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteDialog;
