import dynamic from 'next/dynamic';

// Dynamic import with proper typing for Next 15 / React 19
const AddressMinimap = dynamic<any>(
  () =>
    import('@mapbox/search-js-react').then((mod) => ({
      // Coerce to default export shape to satisfy LoaderComponent typing
      default: mod.AddressMinimap as any,
    })),
  { ssr: false }
);

export default AddressMinimap;
