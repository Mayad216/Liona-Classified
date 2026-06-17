import type {
  AreaCommunityReview,
  AreaInsightTags,
  BuildingAgeTag,
  CrowdLevel,
  NationalityShare,
  PricePerception,
  UpkeepQuality,
} from "@/types/areaInsights";

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function crowdFromScore(score: number): CrowdLevel {
  if (score <= 2.2) return "quiet";
  if (score <= 3.4) return "moderate";
  return "crowded";
}

function ageFromScore(score: number): BuildingAgeTag {
  if (score <= 2.2) return "new";
  if (score <= 3.4) return "mixed";
  return "established";
}

function priceFromScore(score: number): PricePerception {
  if (score <= 2.4) return "fair";
  if (score <= 3.5) return "pricey";
  return "overpriced";
}

function upkeepFromScore(score: number): UpkeepQuality {
  if (score >= 4.2) return "excellent";
  if (score >= 3.4) return "good";
  if (score >= 2.5) return "fair";
  return "poor";
}

function topNationalities(reviews: AreaCommunityReview[]): NationalityShare[] {
  const counts: Record<string, number> = {};
  for (const r of reviews) {
    for (const n of r.nationalitiesMentioned) {
      counts[n] = (counts[n] ?? 0) + 1;
    }
  }
  const total = Object.values(counts).reduce((s, c) => s + c, 0) || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([nationality, count]) => ({
      nationality,
      percent: Math.round((count / total) * 100),
    }));
}

export function aggregateReviews(reviews: AreaCommunityReview[]): {
  communityRating: number;
  reviewCount: number;
  tags: AreaInsightTags;
} {
  const reviewCount = reviews.length;
  const communityRating =
    reviewCount === 0 ? 0 : Math.round(avg(reviews.map((r) => r.rating)) * 10) / 10;

  const crowdScore = avg(reviews.map((r) => r.crowdScore));
  const buildingAgeScore = avg(reviews.map((r) => r.buildingAgeScore));
  const valueScore = avg(reviews.map((r) => r.valueScore));
  const cleanlinessScore = avg(reviews.map((r) => r.cleanlinessScore));
  const maintenanceScore = avg(reviews.map((r) => r.maintenanceScore));

  return {
    communityRating,
    reviewCount,
    tags: {
      crowd: crowdFromScore(crowdScore),
      crowdScore: Math.round(crowdScore * 10) / 10,
      buildingAge: ageFromScore(buildingAgeScore),
      buildingAgeScore: Math.round(buildingAgeScore * 10) / 10,
      pricePerception: priceFromScore(valueScore),
      valueScore: Math.round(valueScore * 10) / 10,
      cleanliness: upkeepFromScore(cleanlinessScore),
      cleanlinessScore: Math.round(cleanlinessScore * 10) / 10,
      maintenance: upkeepFromScore(maintenanceScore),
      maintenanceScore: Math.round(maintenanceScore * 10) / 10,
      mainNationalities: topNationalities(reviews),
    },
  };
}

export const CROWD_LABELS: Record<CrowdLevel, string> = {
  quiet: "Quiet",
  moderate: "Moderate",
  crowded: "Crowded",
};

export const AGE_LABELS: Record<BuildingAgeTag, string> = {
  new: "New builds",
  mixed: "Mixed stock",
  established: "Older buildings",
};

export const PRICE_LABELS: Record<PricePerception, string> = {
  fair: "Fair value",
  pricey: "Pricey",
  overpriced: "Overpriced",
};

export const CLEANLINESS_LABELS: Record<UpkeepQuality, string> = {
  excellent: "Very clean",
  good: "Clean",
  fair: "Average cleanliness",
  poor: "Cleanliness issues",
};

export const MAINTENANCE_LABELS: Record<UpkeepQuality, string> = {
  excellent: "Well maintained",
  good: "Good upkeep",
  fair: "Average upkeep",
  poor: "Poor maintenance",
};
