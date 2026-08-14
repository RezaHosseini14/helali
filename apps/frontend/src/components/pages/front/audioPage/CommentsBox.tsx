'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  addComment,
  getCommentsByTarget,
  type CommentTargetType,
} from 'services/comment/commentServices';

import { commentModel } from 'models/comment.model';

import type { commentType } from 'types/comment.type';

import TexAreaField from '@/components/global/fields/TexAreaField';
import TextField from '@/components/global/fields/TextField';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getSchemaErrorMessage } from '@/lib/validate-schema';
import CommentsLoading from './CommentsLoading';

interface ICommentFormValue {
  author: string;
  text: string;
}

interface ICommentsBoxProps {
  id: number;
  type: CommentTargetType;
}

function CommentsBox({ id, type }: ICommentsBoxProps) {
  const [formValue, setFormValue] = useState<ICommentFormValue>({
    author: '',
    text: '',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['comments', type, id],
    queryFn: () => getCommentsByTarget(type, Number(id)),
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ targetId, body }: { targetId: number; body: ICommentFormValue }) =>
      addComment(type, targetId, body),
  });

  const handleInputChange = (name: keyof ICommentFormValue, value: string) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddComment = async () => {
    const error = getSchemaErrorMessage(commentModel, formValue);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      await mutateAsync({
        targetId: id,
        body: formValue,
      });
      void refetch();
      toast.success('دیدگاه با موفقیت ثبت شد و پس از تأیید نمایش داده می‌شود');
      setFormValue({ author: '', text: '' });
    } catch {
      toast.error('خطا در ارسال دیدگاه');
    }
  };

  if (isLoading) {
    return <CommentsLoading />;
  }

  const comments = (data?.data?.comments ?? []) as commentType[];

  return (
    <section className="space-y-4">
      <form
        className="overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void handleAddComment();
        }}
      >
        <h2 className="mb-4 text-base font-semibold text-foreground">ثبت دیدگاه</h2>

        <div className="mb-4 grid grid-cols-12 gap-3">
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

        <Button type="submit" isLoading={isPending}>
          ثبت دیدگاه
        </Button>
      </form>

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
            هنوز دیدگاهی ثبت نشده است. اولین نفر باشید.
          </p>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-2xl border border-border/60 bg-card px-4 py-4 shadow-sm transition hover:border-primary/20"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-content-center rounded-full bg-secondary text-primary">
                  <i className="ki-solid ki-user text-xl" />
                </div>
                <span className="font-semibold text-foreground">{comment.author}</span>
              </div>
              <Separator className="my-3" />
              <p className="leading-7 text-foreground/90">{comment.text}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default CommentsBox;
