import { toast } from 'react-hot-toast';

export const getFileSize = (input: number | string) => {
  let output = '';
  if (typeof input !== 'undefined') {
    let level = 0;
    let parsedInput = typeof input === 'string' ? parseFloat(input) : input;
    while (parsedInput > 1000) {
      parsedInput /= 1000;
      level++;
    }
    switch (level) {
      case 0:
        output = `${parsedInput.toFixed(2)} B`;
        break;
      case 1:
        output = `${parsedInput.toFixed(2)} KB`;
        break;
      case 2:
        output = `${parsedInput.toFixed(2)} MB`;
        break;
      case 3:
        output = `${parsedInput.toFixed(2)} TB`;
        break;
      case 4:
        output = `${parsedInput.toFixed(2)} PB`;
        break;
      case 5:
        output = `${parsedInput.toFixed(2)} HB`;
        break;
      default:
        output = `${parsedInput.toFixed(2)} B`;
        break;
    }
  }
  return output;
};

export const shamsi = (date: string, format?: string): string => {
  if (!date) return '';
  const d = new Date(date); // تاریخ را به شی Date تبدیل می‌کنیم.
  const year = d.toLocaleDateString('fa-IR', { year: 'numeric' });
  const month = d.toLocaleDateString('fa-IR', { month: '2-digit' });
  const day = d.toLocaleDateString('fa-IR', { day: '2-digit' });

  if (format === 'YYYY/MM/DD') {
    return `${year}/${month}/${day}`;
  } else if (format === 'hh:mm:ss') {
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');
    const second = d.getSeconds().toString().padStart(2, '0');
    return `${hour}:${minute}:${second}`;
  } else {
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');
    const second = d.getSeconds().toString().padStart(2, '0');
    return `${hour}:${minute}:${second} - ${year}/${month}/${day}`;
  }
};

export const handleResponse = (
  response: any,
  error: any = null,
  successDefaultMessage: string = 'عملیات با موفقیت انجام شد',
  errorDefaultMessage: string = 'خطای نامشخص',
) => {
  if (response) {
    const statusCode = response?.status;
    const successMessage = response?.data?.message || successDefaultMessage;

    switch (statusCode) {
      case 200:
      case 201:
      case 202:
        toast.success(successMessage);
    }
  }

  if (error) {
    const statusCode = error?.response?.status;
    const errorMessage = error?.response?.data?.message || errorDefaultMessage;

    switch (statusCode) {
      case 400:
        toast.error('درخواست نامعتبر است: ' + errorMessage);
        break;
      case 413:
        toast.error('حجم فایل بیش از حد مجاز است');
        break;
      case 500:
        toast.error('خطای سرور: ' + errorMessage);
        break;
      // default:
      //   toast.error('ارتباط با سرور برقرار نشد: ' + errorMessage);
    }
    return false;
  }
};

export const formatTime = (seconds: number) =>
  [seconds / 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':');

export const getRandomNumber = (min: number = 100, max: number = 1000): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getAverageColor = (imageSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return reject('Canvas not supported');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      resolve(`rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = reject;
  });
};

export const darkenColor = (color: string, percent: number = 20) => {
  const rgb = color.match(/\d+/g)?.map(Number);
  if (!rgb) return color;

  const darkened = rgb.map((c) => Math.max(0, c - (c * percent) / 100));

  return `rgb(${darkened[0]}, ${darkened[1]}, ${darkened[2]})`;
};
