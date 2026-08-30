import { FilePreview } from 'restosync-web';

export const Files = () => (
  <div className='max-w-md'>
    <FilePreview
      files={[
        { id: '1', name: 'menu-autumn-2026.pdf', type: 'application/pdf' },
        { id: '2', name: 'plating-guide.docx', type: 'application/msword' },
        {
          id: '3',
          name: 'hero-dish.jpg',
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200'
        }
      ]}
    />
  </div>
);

export const Uploading = () => (
  <div className='max-w-md'>
    <FilePreview
      files={[{ id: '1', name: 'wine-list.pdf', type: 'application/pdf', isUploading: true }]}
    />
  </div>
);
