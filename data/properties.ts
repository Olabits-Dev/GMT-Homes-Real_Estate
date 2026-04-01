import "server-only";

import { getGmtContactConfig } from "@/lib/server-env";
import type { Property, PropertyType } from "@/types/property";

// Free-use housing photos stored locally under public/properties.
const housingPhotos = {
  apartmentBalconies: "/properties/library/apartment-balconies.jpg",
  compactModernInterior: "/properties/library/compact-modern-interior.jpg",
  cozyApartmentRoom: "/properties/library/cozy-apartment-room.jpg",
  modernApartmentExterior: "/properties/library/modern-apartment-exterior.jpg",
  modernHouseExterior: "/properties/lagoon-view-villa/exterior-main.jpg",
  officeKitchenApartment: "/properties/library/office-kitchen-apartment.jpg",
  openPlanInterior: "/properties/lagoon-view-villa/interior-open-plan.jpg",
  penthouseDiningInterior: "/properties/library/penthouse-dining-interior.jpg",
  terracedHouseExterior: "/properties/library/terraced-house-exterior.jpg",
  villaMansionExterior: "/properties/lagoon-view-villa/exterior-waterfront.jpg",
  warmMinimalApartment: "/properties/library/warm-minimal-apartment.jpg",
};

const gmtContact = getGmtContactConfig();

const gmtAgent = {
  company: gmtContact.company,
  email: gmtContact.email,
  initials: gmtContact.initials,
  name: gmtContact.name,
  phone: gmtContact.phone,
  responseTime: gmtContact.responseTime,
  role: gmtContact.role,
} as const;

export const properties: Property[] = [
  {
    id: "prop-001",
    slug: "lagoon-view-villa-lekki",
    title: "Lagoon View Villa",
    price: 325_000_000,
    billingPeriod: null,
    location: "Admiralty Way, Lekki Phase 1",
    city: "Lagos",
    state: "Lagos",
    type: "Villa",
    status: "For Sale",
    bedrooms: 5,
    bathrooms: 6,
    area: 540,
    shortDescription:
      "A waterfront villa with private lounge decks, warm interiors, and a flexible family wing.",
    description:
      "Lagoon View Villa is designed for buyers who want resort-level calm without leaving the city. The home combines open entertaining zones, a bright work-from-home suite, and layered indoor-outdoor living with breezy terraces facing the water.",
    highlight: "Private waterfront deck and entertainment lounge",
    gallery: [
      housingPhotos.modernHouseExterior,
      housingPhotos.villaMansionExterior,
      housingPhotos.openPlanInterior,
    ],
    featured: true,
    yearBuilt: 2024,
    amenities: [
      "Smart home access",
      "Infinity plunge pool",
      "Cinema room",
      "Chef's kitchen",
      "Walk-in wardrobes",
      "Two-car garage",
    ],
    agent: gmtAgent,
    source: "seed",
    coordinates: { lat: 6.4336, lng: 3.4698 },
  },
  {
    id: "prop-002",
    slug: "skyline-penthouse-ikoyi",
    title: "Skyline Penthouse",
    price: 410_000_000,
    billingPeriod: null,
    location: "Bourdillon Road, Ikoyi",
    city: "Lagos",
    state: "Lagos",
    type: "Penthouse",
    status: "For Sale",
    bedrooms: 4,
    bathrooms: 5,
    area: 410,
    shortDescription:
      "A double-height penthouse with city views, a private rooftop terrace, and polished concierge amenities.",
    description:
      "Skyline Penthouse balances bold architecture with practical luxury. It offers a dramatic living room, a quiet study, spa-inspired baths, and a rooftop setting built for sunset dinners or small private events.",
    highlight: "Private rooftop terrace with panoramic skyline views",
    gallery: [
      housingPhotos.penthouseDiningInterior,
      housingPhotos.compactModernInterior,
      housingPhotos.cozyApartmentRoom,
    ],
    featured: true,
    yearBuilt: 2023,
    amenities: [
      "Rooftop lounge",
      "Dedicated lift access",
      "Gym membership",
      "24/7 concierge",
      "Backup power",
      "Private study",
    ],
    agent: {
      ...gmtAgent,
      initials: "TA",
      name: "Tomiwa Adebayo",
      role: "Luxury Homes Consultant",
    },
    source: "seed",
    coordinates: { lat: 6.4541, lng: 3.4338 },
  },
  {
    id: "prop-003",
    slug: "garden-court-terrace-yaba",
    title: "Garden Court Terrace",
    price: 8_500_000,
    billingPeriod: "year",
    location: "Herbert Macaulay Way, Yaba",
    city: "Lagos",
    state: "Lagos",
    type: "Terrace",
    status: "For Rent",
    bedrooms: 3,
    bathrooms: 4,
    area: 220,
    shortDescription:
      "A calm family terrace close to top schools, coworking hubs, and quick Island links.",
    description:
      "Garden Court Terrace is made for modern city living. You get airy communal spaces, quiet bedrooms upstairs, and a compact outdoor court that works for morning coffee, kids play, or a small herb garden.",
    highlight: "Family-friendly courtyard with excellent commuter access",
    gallery: [
      housingPhotos.terracedHouseExterior,
      housingPhotos.warmMinimalApartment,
      housingPhotos.officeKitchenApartment,
    ],
    featured: true,
    yearBuilt: 2022,
    amenities: [
      "Dedicated parking",
      "Water treatment",
      "Fiber internet ready",
      "En-suite bedrooms",
      "Fitted wardrobes",
      "Visitor lounge",
    ],
    agent: {
      ...gmtAgent,
      initials: "MN",
      name: "Mariam Nwachukwu",
      role: "Rental Experience Specialist",
    },
    source: "seed",
    coordinates: { lat: 6.5082, lng: 3.3719 },
  },
  {
    id: "prop-004",
    slug: "artisan-loft-wuse-2",
    title: "Artisan Loft",
    price: 14_000_000,
    billingPeriod: "year",
    location: "Aminu Kano Crescent, Wuse 2",
    city: "Abuja",
    state: "FCT",
    type: "Apartment",
    status: "For Rent",
    bedrooms: 2,
    bathrooms: 3,
    area: 165,
    shortDescription:
      "A design-forward apartment with warm finishes, airy natural light, and premium proximity to business districts.",
    description:
      "Artisan Loft offers a softer, more curated alternative to generic serviced apartments. The layout is efficient, the finishes feel tailored, and the location makes it easy to move between meetings, dining, and weekend plans.",
    highlight: "Design-led interiors in a high-demand central district",
    gallery: [
      housingPhotos.officeKitchenApartment,
      housingPhotos.cozyApartmentRoom,
      housingPhotos.compactModernInterior,
    ],
    featured: false,
    yearBuilt: 2024,
    amenities: [
      "Serviced reception",
      "Smart locks",
      "Private balcony",
      "Laundry area",
      "Backup power",
      "Shared gym",
    ],
    agent: {
      ...gmtAgent,
      initials: "EO",
      name: "Emeka Okafor",
      role: "Abuja City Rentals",
    },
    source: "seed",
    coordinates: { lat: 9.0802, lng: 7.4913 },
  },
  {
    id: "prop-005",
    slug: "courtyard-duplex-ibadan",
    title: "Courtyard Duplex",
    price: 96_000_000,
    billingPeriod: null,
    location: "Jericho GRA, Ibadan",
    city: "Ibadan",
    state: "Oyo",
    type: "Duplex",
    status: "For Sale",
    bedrooms: 4,
    bathrooms: 5,
    area: 360,
    shortDescription:
      "A generous duplex with a central courtyard, quiet neighborhood streets, and strong long-term family value.",
    description:
      "Courtyard Duplex is a practical upscale home with thoughtful zoning for family life. The central courtyard improves airflow and daylight, while the surrounding rooms give privacy without disconnecting the house.",
    highlight: "Central courtyard that improves light, airflow, and privacy",
    gallery: [
      housingPhotos.modernHouseExterior,
      housingPhotos.openPlanInterior,
      housingPhotos.officeKitchenApartment,
    ],
    featured: false,
    yearBuilt: 2021,
    amenities: [
      "Home office",
      "Two living rooms",
      "Security post",
      "Borehole",
      "Family den",
      "Outdoor sit-out",
    ],
    agent: {
      ...gmtAgent,
      initials: "AB",
      name: "Ayo Bello",
      role: "Regional Sales Advisor",
    },
    source: "seed",
    coordinates: { lat: 7.4018, lng: 3.8847 },
  },
  {
    id: "prop-006",
    slug: "harbour-studio-victoria-island",
    title: "Harbour Studio",
    price: 5_800_000,
    billingPeriod: "year",
    location: "Ahmadu Bello Way, Victoria Island",
    city: "Lagos",
    state: "Lagos",
    type: "Studio",
    status: "For Rent",
    bedrooms: 1,
    bathrooms: 1,
    area: 85,
    shortDescription:
      "A polished studio tailored for young professionals who want a compact home in the middle of the city.",
    description:
      "Harbour Studio keeps things compact without feeling cramped. Built-in storage, a clean kitchen line, and a bright sleeping zone make it ideal for a first upscale rental or a city crash pad near work.",
    highlight: "Compact premium rental near corporate and lifestyle hubs",
    gallery: [
      housingPhotos.warmMinimalApartment,
      housingPhotos.compactModernInterior,
      housingPhotos.cozyApartmentRoom,
    ],
    featured: false,
    yearBuilt: 2023,
    amenities: [
      "Compact fitted kitchen",
      "24/7 security",
      "Air conditioning",
      "Elevator access",
      "Waterfront jogging route",
      "Laundry niche",
    ],
    agent: {
      ...gmtAgent,
      initials: "KO",
      name: "Kelechi Obi",
      role: "Urban Rental Advisor",
    },
    source: "seed",
    coordinates: { lat: 6.4281, lng: 3.4219 },
  },
  {
    id: "prop-007",
    slug: "sunset-manor-asokoro",
    title: "Sunset Manor",
    price: 285_000_000,
    billingPeriod: null,
    location: "Yedseram Street, Asokoro",
    city: "Abuja",
    state: "FCT",
    type: "Villa",
    status: "For Sale",
    bedrooms: 5,
    bathrooms: 6,
    area: 500,
    shortDescription:
      "A diplomatic-area home with layered living spaces, formal entertaining rooms, and a serene garden edge.",
    description:
      "Sunset Manor is built for buyers who want privacy, prestige, and hosting flexibility. The layout includes formal and casual zones, generous bedroom suites, and a garden line that softens the entire home.",
    highlight: "Prestige address with private garden entertaining spaces",
    gallery: [
      housingPhotos.villaMansionExterior,
      housingPhotos.modernHouseExterior,
      housingPhotos.openPlanInterior,
    ],
    featured: false,
    yearBuilt: 2020,
    amenities: [
      "Formal dining room",
      "Guest suite",
      "Garden pavilion",
      "Driver's room",
      "Backup power",
      "Security systems",
    ],
    agent: {
      ...gmtAgent,
      initials: "IS",
      name: "Ifeoma Sule",
      role: "Prime Residences Advisor",
    },
    source: "seed",
    coordinates: { lat: 9.0443, lng: 7.5316 },
  },
  {
    id: "prop-008",
    slug: "terrace-row-chevron",
    title: "Terrace Row Residence",
    price: 142_000_000,
    billingPeriod: null,
    location: "Chevron Drive, Lekki",
    city: "Lagos",
    state: "Lagos",
    type: "Terrace",
    status: "For Sale",
    bedrooms: 4,
    bathrooms: 5,
    area: 290,
    shortDescription:
      "A bright modern terrace with balanced family spaces, clean detailing, and excellent school access.",
    description:
      "Terrace Row Residence is a solid middle ground between compact city apartments and large detached homes. It gives growing families practical room, modern finishes, and dependable resale appeal in a strong corridor.",
    highlight: "Strong resale corridor with practical family-first planning",
    gallery: [
      housingPhotos.terracedHouseExterior,
      housingPhotos.apartmentBalconies,
      housingPhotos.warmMinimalApartment,
    ],
    featured: false,
    yearBuilt: 2024,
    amenities: [
      "Family lounge",
      "Maid room",
      "Smart lighting",
      "Water treatment",
      "Community park",
      "Security estate",
    ],
    agent: {
      ...gmtAgent,
      initials: "RA",
      name: "Ridwan Afolabi",
      role: "Residential Sales Specialist",
    },
    source: "seed",
    coordinates: { lat: 6.4592, lng: 3.5706 },
  },
];

export function getFeaturedProperties() {
  return properties.filter((property) => property.featured);
}

export function getPropertyBySlug(slug: string) {
  return properties.find((property) => property.slug === slug);
}

export function getDefaultGalleryForType(type: PropertyType) {
  switch (type) {
    case "Apartment":
      return [
        housingPhotos.officeKitchenApartment,
        housingPhotos.cozyApartmentRoom,
        housingPhotos.compactModernInterior,
      ];
    case "Duplex":
      return [
        housingPhotos.modernHouseExterior,
        housingPhotos.openPlanInterior,
        housingPhotos.officeKitchenApartment,
      ];
    case "Penthouse":
      return [
        housingPhotos.penthouseDiningInterior,
        housingPhotos.compactModernInterior,
        housingPhotos.cozyApartmentRoom,
      ];
    case "Studio":
      return [
        housingPhotos.warmMinimalApartment,
        housingPhotos.compactModernInterior,
        housingPhotos.cozyApartmentRoom,
      ];
    case "Terrace":
      return [
        housingPhotos.terracedHouseExterior,
        housingPhotos.apartmentBalconies,
        housingPhotos.warmMinimalApartment,
      ];
    case "Villa":
      return [
        housingPhotos.modernHouseExterior,
        housingPhotos.villaMansionExterior,
        housingPhotos.openPlanInterior,
      ];
  }
}
