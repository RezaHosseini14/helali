import React from 'react';
import { Whisper, Tooltip } from 'rsuite';

type IconButtonPropsType = {
  onClick: () => void;
  className: string;
  icon: string;
  tooltipText?: string; // Optional tooltip text
};

function IconButton(props: IconButtonPropsType) {
  const renderButton = (
    <button className={props.className} onClick={props.onClick}>
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

  return renderButton; // Return without tooltip if no tooltipText is provided
}

export default IconButton;
