import Header from '@/components/layouts/children/Header';
import ChildrenAlbum from '@/components/pages/children/ChildrenAlbum';
import ChildrenAudios from '@/components/pages/children/ChildrenAudios';
import ChildrenFooter from '@/components/pages/children/ChildrenFooter';
import ChildrenGallery from '@/components/pages/children/ChildrenGallery';
import ChildrenQuickNav from '@/components/pages/children/ChildrenQuickNav';
import ChildrenStorySky from '@/components/pages/children/ChildrenStorySky';
import ChildrenVideos from '@/components/pages/children/ChildrenVideos';
import ChildrenWelcome from '@/components/pages/children/ChildrenWelcome';

function ChildrenPage() {
  return (
    <>
      <Header />
      <ChildrenWelcome />
      <ChildrenQuickNav />
      <ChildrenAudios />
      <ChildrenVideos />
      <ChildrenAlbum />
      <ChildrenStorySky />
      <ChildrenGallery />
      <ChildrenFooter />
    </>
  );
}

export default ChildrenPage;
