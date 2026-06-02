import dynamic from 'next/dynamic';

const BookingSection = dynamic(() => import('../sections/BookingSection'), {
  loading: () => <div style={{ minHeight: '100vh', background: '#0D0D0D' }} />,
});

export default function BookingPage() {
  return <BookingSection />;
}
