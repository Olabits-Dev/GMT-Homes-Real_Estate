export const cityOptions = [
  {
    city: "Lagos",
    coordinates: { lat: 6.5244, lng: 3.3792 },
    label: "Lagos, Lagos",
    state: "Lagos",
  },
  {
    city: "Abuja",
    coordinates: { lat: 9.0765, lng: 7.3986 },
    label: "Abuja, FCT",
    state: "FCT",
  },
  {
    city: "Ibadan",
    coordinates: { lat: 7.3775, lng: 3.947 },
    label: "Ibadan, Oyo",
    state: "Oyo",
  },
  {
    city: "Port Harcourt",
    coordinates: { lat: 4.8156, lng: 7.0498 },
    label: "Port Harcourt, Rivers",
    state: "Rivers",
  },
  {
    city: "Enugu",
    coordinates: { lat: 6.4571, lng: 7.5259 },
    label: "Enugu, Enugu",
    state: "Enugu",
  },
] as const;

export type CityOption = (typeof cityOptions)[number];
