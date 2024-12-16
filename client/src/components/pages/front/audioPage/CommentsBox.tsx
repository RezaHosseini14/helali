import React, { useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Form, Placeholder } from 'rsuite';
import toast from 'react-hot-toast';

// Services
import { addAudioComment, allAudioComments } from 'services/audio/audioServices';

//model
import { commentModel } from 'models/comment.model';

// Components
import TexAreaField from '@/components/global/fields/TexAreaField';
import TextField from '@/components/global/fields/TextField';

// Types
import { commentType } from 'types/comment.type';

type CommentFormValueType = {
  author: string;
  text: string;
};

function CommentsBox({ id }: { id: number }) {
  // ---------------------- State & Hooks ----------------------
  const formRef = useRef<any>();
  const [formValue, setFormValue] = useState<CommentFormValueType>({
    author: '',
    text: '',
  });

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['allAudioComments'],
    queryFn: allAudioComments,
  });
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => addAudioComment(id, body),
  });

  // ---------------------- Event Handlers ----------------------
  const handleInputChange = (name: keyof CommentFormValueType, value: string) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddComment = async () => {
    if (!formRef.current.check()) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    try {
      await mutateAsync({
        id,
        body: formValue,
      });
      refetch(); // Refresh comments list
      toast.success('دیدگاه با موفقیت اضافه شد');
      setFormValue({ author: '', text: '' }); // Reset form
    } catch (error) {
      toast.error('خطا در ارسال دیدگاه');
    }
  };

  return (
    <div>
      {/* Form: Add a new comment */}
      {isLoading ? (
        <Placeholder.Graph active className="rounded-xl w-full !h-80" />
      ) : (
        <Form model={commentModel} formValue={formValue} ref={formRef} fluid className="bg-mainColor/30 p-4 rounded-xl">
          <div className="grid grid-cols-12 gap-2 mb-4">
            <TextField
              name="author"
              title="نام و نام خانوادگی"
              containerClassName="col-span-12"
              value={formValue.author}
              onChange={(value: string) => handleInputChange('author', value)}
            />

            <TexAreaField
              title="دیدگاه شما"
              name="text"
              containerClassName="col-span-12"
              value={formValue.text}
              onChange={(value: string) => handleInputChange('text', value)}
              rows={3}
            />
          </div>
          <Button appearance="primary" onClick={handleAddComment} loading={isPending}>
            ثبت دیدگاه
          </Button>
        </Form>
      )}

      {/* Comments List */}

      {isLoading ? (
        <div className="flex flex-col gap-4 mt-4">
          <Placeholder.Graph active className="rounded-xl w-full !h-32" />
          <Placeholder.Graph active className="rounded-xl w-full !h-32" />
          <Placeholder.Graph active className="rounded-xl w-full !h-32" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {data?.data?.comments.length > 0 &&
            data?.data?.comments.map((comment: commentType) => (
              <div key={comment.id} className="bg-white border border-mainColor px-4 py-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-300 size-10 rounded-full grid place-content-center text-2xl">
                    <i className="ki-solid ki-user"></i>
                  </div>
                  {comment.author}
                </div>
                <hr className="my-2 border-mainColor" />
                {comment.text}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default CommentsBox;
