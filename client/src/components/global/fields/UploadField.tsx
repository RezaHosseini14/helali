//@ts-nocheck
'use client';
import { uploaderStyle } from '@/jsons/style';
import { Form, Uploader } from 'rsuite';

type UploadFieldType = {
  title: string;
  name: string;
  handleImageChange: (images: File) => void;
  accept: string;
  containerClassName?: string;
  fileList: any;
};

function UploadField(props: UploadFieldType) {
  return (
    <Form.Group className={props.containerClassName}>
      <Form.ControlLabel className="font-semibold text-base text-spGreen">{props.title}</Form.ControlLabel>

      <Uploader
        fileList={props.fileList}
        autoUpload={false}
        onChange={props.handleImageChange}
        draggable
        multiple
        listType="picture-text"
        accept={props.accept}
        name={props.name}
        action={''}
        draggable
      >
        <div style={uploaderStyle}>
          <span className="font-bold text-xl text-spGreen">{props.title}</span>
        </div>
      </Uploader>
    </Form.Group>
  );
}

export default UploadField;
