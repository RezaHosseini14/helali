import React from 'react';
import { Button, Modal } from 'rsuite';

type ConfirmModalPropsType = {
  open: boolean;
  onClose: () => void;
  handleDelete: () => void;
  loading: boolean;
  message: string;
  title: string;
  confirmMsg: string;
};

function ConfirmModal(props: ConfirmModalPropsType) {
  return (
    <Modal open={props.open} onClose={props.onClose} size="xs">
      <Modal.Header>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.message}</Modal.Body>
      <div className="flex items-center justify-between">
        <Button onClick={props.handleDelete} appearance="primary" color="red" loading={props.loading}>
          {props.confirmMsg}
        </Button>
        <Button onClick={props.onClose} appearance="subtle">
          انصراف
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
