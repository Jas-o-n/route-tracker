import dynamic from 'next/dynamic';

// Dynamic import with proper typing
const AddressMinimap = dynamic<any>(
  () => import('@mapbox/search-js-react').then((mod) => mod.AddressMinimap),
  { ssr: false }
);

export default AddressMinimap;
