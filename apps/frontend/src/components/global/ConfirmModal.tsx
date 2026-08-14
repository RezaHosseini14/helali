'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';

interface IConfirmModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly handleDelete: () => void;
  readonly loading: boolean;
  readonly message: string;
  readonly title: string;
  readonly confirmMsg: string;
}

function ConfirmModal(props: IConfirmModalProps) {
  return (
    <AlertDialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) {
          props.onClose();
        }
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>{props.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={props.onClose}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={props.loading}
            onClick={props.handleDelete}
          >
            {props.loading ? <Spinner data-icon="inline-start" /> : null}
            {props.confirmMsg}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmModal;
