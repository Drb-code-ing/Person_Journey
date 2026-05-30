import { notFound } from "next/navigation";
import { getTourById } from "../../lib/tours";
import TourDetailSection from "../../sections/TourDetailSection";

export default async function TourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tour = getTourById(id);
  if (!tour) notFound();
  return <TourDetailSection tour={tour} />;
}
