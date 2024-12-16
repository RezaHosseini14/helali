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
