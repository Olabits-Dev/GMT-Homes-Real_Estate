import type { Metadata } from "next";
import { PropertyDetailResolver } from "@/components/property-detail-resolver";
import { getPropertyBySlug, properties } from "@/data/properties";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return properties.map((property) => ({
    slug: property.slug,
  }));
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Property Details",
      description: "Explore real estate listing details on GMT Homes.",
    };
  }

  return {
    title: property.title,
    description: property.shortDescription,
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug) ?? null;

  return <PropertyDetailResolver slug={slug} initialProperty={property} />;
}

