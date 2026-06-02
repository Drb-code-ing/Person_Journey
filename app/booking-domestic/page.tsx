import dynamic from 'next/dynamic';

const BookingSectionDomestic = dynamic(() => import('../sections/BookingSectionDomestic'), {
  loading: () => <div style={{ minHeight: '100vh', background: '#0D0D0D' }} />,
});

export const metadata = {
  title: '国内奢旅 — AURUM VOYAGES',
  description: '无需签证，说走就走。15个国内顶级秘境，64条奢华路线，高铁/航班/直升机任您选择。',
};

export default function BookingDomesticPage() {
  return <BookingSectionDomestic />;
}
