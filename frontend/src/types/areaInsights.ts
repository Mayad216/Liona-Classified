import type { Emirate } from "@/types";

export type AreaPlaceType = "neighborhood" | "building";

export type CrowdLevel = "quiet" | "moderate" | "crowded";
export type BuildingAgeTag = "new" | "mixed" | "established";
export type PricePerception = "fair" | "pricey" | "overpriced";
/** 1 = poor, 5 = excellent */
export type UpkeepQuality = "excellent" | "good" | "fair" | "poor";

/** Single community review used to derive area tags. */
export interface AreaCommunityReview {
  id: string;
  author: string;
  rating: number;
  /** 1 = very quiet, 5 = very crowded */
  crowdScore: number;
  /** 1 = brand new, 5 = very old building stock */
  buildingAgeScore: number;
  /** 1 = great value, 5 = overpriced */
  valueScore: number;
  /** 1 = dirty / neglected, 5 = very clean common areas & flats */
  cleanlinessScore: number;
  /** 1 = poor upkeep, 5 = excellent building maintenance */
  maintenanceScore: number;
  nationalitiesMentioned: string[];
  text: string;
  helpful: number;
  postedAt: string;
  /** Set on user-submitted reviews — current vs past residence at time of review. */
  residenceStatus?: "current" | "past";
}

export interface NationalityShare {
  nationality: string;
  percent: number;
}

export interface AreaInsightTags {
  crowd: CrowdLevel;
  crowdScore: number;
  buildingAge: BuildingAgeTag;
  buildingAgeScore: number;
  pricePerception: PricePerception;
  valueScore: number;
  cleanliness: UpkeepQuality;
  cleanlinessScore: number;
  maintenance: UpkeepQuality;
  maintenanceScore: number;
  mainNationalities: NationalityShare[];
}

export interface AreaInsight {
  id: string;
  name: string;
  type: AreaPlaceType;
  emirate: Emirate;
  /** Computed from community reviews */
  communityRating: number;
  reviewCount: number;
  tags: AreaInsightTags;
  summary: string;
  reviews: AreaCommunityReview[];
}
