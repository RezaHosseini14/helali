'use client';

import Link from 'next/link';

import { socialMediaItems } from '@/jsons/socialMediaItems';

function FrontFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/70 bg-primary/5">
      <div className="container flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Link href="/" className="potk text-2xl text-foreground sm:text-3xl">
            عبدالرضا هلالی
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            پایگاه حفظ و نشر آثار — صوت، ویدیو و تصاویر رسمی
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 sm:items-end">
          <div className="flex items-center gap-2">
            {socialMediaItems
              .filter((item) => item.url)
              .map((social) => (
                <Link
                  key={social.title}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.title}
                  className="grid size-11 place-content-center rounded-full border border-border bg-card text-lg text-foreground transition hover:border-primary/40 hover:bg-primary hover:text-primary-foreground"
                >
                  <i className={social.icon} />
                </Link>
              ))}
          </div>
          <p className="text-xs text-muted-foreground">© {year} تمامی حقوق محفوظ است</p>
        </div>
      </div>
    </footer>
  );
}

export default FrontFooter;
