import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyDetailView } from "@/components/property-detail-view";
import {
  findPropertyBySlug,
  getAllProperties,
} from "@/lib/community-property-store";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const properties = await getAllProperties();

  return properties.map((property) => ({
    slug: property.slug,
  }));
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await findPropertyBySlug(slug);

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
  const property = await findPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetailView property={property} />;
}
