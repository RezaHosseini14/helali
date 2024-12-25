import React from 'react';
import { Whisper, Tooltip } from 'rsuite';

type IconButtonPropsType = {
  onClick: () => void;
  className: string;
  icon: string;
  tooltipText?: string;
  disabled?: boolean;
};

function IconButton(props: IconButtonPropsType) {
  const renderButton = (
    <button
      className={props.className + ' ' + 'disabled:cursor-not-allowed disabled:opacity-50'}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <i className={props.icon}></i>
    </button>
  );

  if (props.tooltipText) {
    return (
      <Whisper
        placement="top"
        controlId="control-id-hover"
        trigger="hover"
        speaker={<Tooltip>{props.tooltipText}</Tooltip>}
      >
        {renderButton}
      </Whisper>
    );
  }

  return renderButton;
}

export default IconButton;
