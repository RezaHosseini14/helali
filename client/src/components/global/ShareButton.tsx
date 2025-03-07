import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from 'rsuite';

function ShareButton() {
  // ---------------------- State and Ref ----------------------
  const [loading, setLoading] = useState<boolean>(false);

  // ---------------------- Event Handlers ----------------------
  const handleShare = async () => {
    try {
      setLoading(true);
      await navigator.share({
        title: 'Title of the content',
        text: 'Description or text to share',
        url: window.location.href,
      });
      setLoading(false);
      console.log('Content shared successfully');
    } catch (error) {
      alert('Web Share API is not supported on this browser');
    }
  };
  return (
    <Button className='!h-8 flex items-center gap-1 !border border-gray-600' loading={loading} onClick={handleShare}>
      <Icon icon="solar:share-bold-duotone" width="24" height="24" />
      <span>اشتراک گذاری</span>
    </Button>
  );
}

export default ShareButton;
