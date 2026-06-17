import { aggregateReviews } from "@/lib/areaInsights/aggregate";
import type { AreaCommunityReview, AreaInsight } from "@/types/areaInsights";

function buildInsight(
  id: string,
  name: string,
  type: "neighborhood" | "building",
  emirate: AreaInsight["emirate"],
  summary: string,
  reviews: AreaCommunityReview[]
): AreaInsight {
  const { communityRating, reviewCount, tags } = aggregateReviews(reviews);
  return {
    id,
    name,
    type,
    emirate,
    communityRating,
    reviewCount,
    tags,
    summary,
    reviews,
  };
}

const marinaReviews: AreaCommunityReview[] = [
  {
    id: "r1",
    author: "Priya S.",
    rating: 4,
    crowdScore: 4.5,
    buildingAgeScore: 2,
    valueScore: 4,
    cleanlinessScore: 3.5,
    maintenanceScore: 3,
    nationalitiesMentioned: ["Indian", "Filipino"],
    text: "Walkable but lifts are packed at rush hour. Mostly young expats.",
    helpful: 24,
    postedAt: "2026-05-18T10:00:00Z",
  },
  {
    id: "r2",
    author: "James T.",
    rating: 3,
    crowdScore: 5,
    buildingAgeScore: 2.5,
    valueScore: 4.5,
    cleanlinessScore: 4,
    maintenanceScore: 3.5,
    nationalitiesMentioned: ["British", "European"],
    text: "Premium area — you're paying for the view. Very busy on weekends near JBR.",
    helpful: 18,
    postedAt: "2026-05-12T14:00:00Z",
  },
  {
    id: "r3",
    author: "Fatima A.",
    rating: 4,
    crowdScore: 4,
    buildingAgeScore: 2,
    valueScore: 3.5,
    cleanlinessScore: 4,
    maintenanceScore: 3.5,
    nationalitiesMentioned: ["Arab", "Indian"],
    text: "New towers everywhere but rents climbed a lot post-2022.",
    helpful: 31,
    postedAt: "2026-05-05T09:00:00Z",
  },
];

const jltReviews: AreaCommunityReview[] = [
  {
    id: "r4",
    author: "Rohan M.",
    rating: 4,
    crowdScore: 3.5,
    buildingAgeScore: 2.5,
    valueScore: 3,
    cleanlinessScore: 3.5,
    maintenanceScore: 3,
    nationalitiesMentioned: ["Indian", "Pakistani"],
    text: "Better value than Marina, still crowded near metro clusters.",
    helpful: 42,
    postedAt: "2026-05-20T11:00:00Z",
  },
  {
    id: "r5",
    author: "Elena K.",
    rating: 3,
    crowdScore: 3,
    buildingAgeScore: 3,
    valueScore: 3.5,
    cleanlinessScore: 3,
    maintenanceScore: 2.5,
    nationalitiesMentioned: ["Russian", "European"],
    text: "Mix of older and renovated buildings. Parking is a nightmare.",
    helpful: 15,
    postedAt: "2026-05-08T16:00:00Z",
  },
];

const burDubaiReviews: AreaCommunityReview[] = [
  {
    id: "r6",
    author: "Ahmed K.",
    rating: 4,
    crowdScore: 4,
    buildingAgeScore: 4.5,
    valueScore: 2,
    cleanlinessScore: 2.5,
    maintenanceScore: 2,
    nationalitiesMentioned: ["Indian", "Pakistani", "Filipino"],
    text: "Authentic, affordable, older walk-ups. Very dense near metro.",
    helpful: 56,
    postedAt: "2026-05-15T08:00:00Z",
  },
  {
    id: "r7",
    author: "Sara L.",
    rating: 3,
    crowdScore: 4.5,
    buildingAgeScore: 5,
    valueScore: 1.5,
    cleanlinessScore: 2,
    maintenanceScore: 1.5,
    nationalitiesMentioned: ["Indian", "Bangladeshi"],
    text: "Great budget option — buildings are old but rent is fair.",
    helpful: 29,
    postedAt: "2026-05-01T12:00:00Z",
  },
];

const downtownReviews: AreaCommunityReview[] = [
  {
    id: "r8",
    author: "Omar H.",
    rating: 3,
    crowdScore: 4,
    buildingAgeScore: 2,
    valueScore: 5,
    cleanlinessScore: 4,
    maintenanceScore: 4,
    nationalitiesMentioned: ["Arab", "European", "Indian"],
    text: "Iconic but overpriced for bedspaces. Tourist crowds near mall.",
    helpful: 38,
    postedAt: "2026-05-19T18:00:00Z",
  },
  {
    id: "r9",
    author: "Lisa P.",
    rating: 4,
    crowdScore: 3.5,
    buildingAgeScore: 1.5,
    valueScore: 4.5,
    cleanlinessScore: 4.5,
    maintenanceScore: 4.5,
    nationalitiesMentioned: ["European", "American"],
    text: "Mostly newer towers, premium pricing. Quieter than Marina at night.",
    helpful: 12,
    postedAt: "2026-05-10T20:00:00Z",
  },
];

const sharjahReviews: AreaCommunityReview[] = [
  {
    id: "r10",
    author: "Nadia R.",
    rating: 4,
    crowdScore: 3.5,
    buildingAgeScore: 3.5,
    valueScore: 2,
    cleanlinessScore: 3.5,
    maintenanceScore: 3.5,
    nationalitiesMentioned: ["Arab", "Indian", "Pakistani"],
    text: "Family area, good value. Can feel crowded near Sahara Centre.",
    helpful: 44,
    postedAt: "2026-05-14T07:00:00Z",
  },
];

const reemReviews: AreaCommunityReview[] = [
  {
    id: "r11",
    author: "Khalid B.",
    rating: 4,
    crowdScore: 2.5,
    buildingAgeScore: 1.5,
    valueScore: 3.5,
    cleanlinessScore: 4,
    maintenanceScore: 4.5,
    nationalitiesMentioned: ["Arab", "European", "Indian"],
    text: "Modern towers, calmer than Dubai. Prices rising but still OK.",
    helpful: 27,
    postedAt: "2026-05-16T15:00:00Z",
  },
];

const businessBayReviews: AreaCommunityReview[] = [
  {
    id: "r12",
    author: "Mike D.",
    rating: 3,
    crowdScore: 3.5,
    buildingAgeScore: 2,
    valueScore: 4,
    cleanlinessScore: 3.5,
    maintenanceScore: 4,
    nationalitiesMentioned: ["European", "Indian"],
    text: "Office crowd during week, newer buildings, rent feels steep for partitions.",
    helpful: 19,
    postedAt: "2026-05-11T13:00:00Z",
  },
];

const princessTowerReviews: AreaCommunityReview[] = [
  {
    id: "r13",
    author: "Anil V.",
    rating: 3,
    crowdScore: 5,
    buildingAgeScore: 2,
    valueScore: 4,
    cleanlinessScore: 2.5,
    maintenanceScore: 2.5,
    nationalitiesMentioned: ["Indian", "Filipino"],
    text: "Huge tower — always people in lobby. Good metro access but lifts busy.",
    helpful: 33,
    postedAt: "2026-05-17T09:00:00Z",
  },
  {
    id: "r14",
    author: "Chen W.",
    rating: 4,
    crowdScore: 4.5,
    buildingAgeScore: 2.5,
    valueScore: 3.5,
    cleanlinessScore: 3.5,
    maintenanceScore: 3,
    nationalitiesMentioned: ["Chinese", "Indian"],
    text: "Relatively new building, many shared flats. Pricey for what you get.",
    helpful: 21,
    postedAt: "2026-05-06T11:00:00Z",
  },
];

const silvereneReviews: AreaCommunityReview[] = [
  {
    id: "r15",
    author: "Sofia R.",
    rating: 4,
    crowdScore: 3,
    buildingAgeScore: 1.5,
    valueScore: 4,
    cleanlinessScore: 4.5,
    maintenanceScore: 4.5,
    nationalitiesMentioned: ["European", "Filipino"],
    text: "Newer Marina tower, better maintained. Still expensive vs JLT.",
    helpful: 16,
    postedAt: "2026-05-13T10:00:00Z",
  },
];

const alKhailReviews: AreaCommunityReview[] = [
  {
    id: "r16",
    author: "Hassan M.",
    rating: 4,
    crowdScore: 3,
    buildingAgeScore: 2,
    valueScore: 2.5,
    cleanlinessScore: 3.5,
    maintenanceScore: 3.5,
    nationalitiesMentioned: ["Indian", "Pakistani", "Arab"],
    text: "Solid JLT cluster, fair rents, mix of families and professionals.",
    helpful: 28,
    postedAt: "2026-05-09T14:00:00Z",
  },
];

const rawInsights: AreaInsight[] = [
  buildInsight(
    "area-marina",
    "Dubai Marina",
    "neighborhood",
    "Dubai",
    "Community reviews paint Marina as busy and premium — strong South Asian and European expat mix, newer towers, and prices often called overpriced.",
    marinaReviews
  ),
  buildInsight(
    "area-jlt",
    "Jumeirah Lake Towers",
    "neighborhood",
    "Dubai",
    "Seen as Marina-adjacent with slightly better value; moderate crowds, mixed building ages, Indian and Pakistani professionals dominate posts.",
    jltReviews
  ),
  buildInsight(
    "area-bur-dubai",
    "Bur Dubai",
    "neighborhood",
    "Dubai",
    "Classic budget hub — reviewers praise value but flag older stock, high density, and a very South Asian tenant mix.",
    burDubaiReviews
  ),
  buildInsight(
    "area-downtown",
    "Downtown Dubai",
    "neighborhood",
    "Dubai",
    "Newer skyline but community posts frequently mention overpricing and tourist-driven crowds near attractions.",
    downtownReviews
  ),
  buildInsight(
    "area-al-nahda",
    "Al Nahda",
    "neighborhood",
    "Sharjah",
    "Sharjah-side favourite for families — fair rents, moderate bustle, Arab and South Asian communities.",
    sharjahReviews
  ),
  buildInsight(
    "area-reem",
    "Al Reem Island",
    "neighborhood",
    "Abu Dhabi",
    "Abu Dhabi reviewers like the modern, calmer towers; diverse Arab and expat mix with slowly rising rents.",
    reemReviews
  ),
  buildInsight(
    "area-business-bay",
    "Business Bay",
    "neighborhood",
    "Dubai",
    "Weekday office crowd, newer builds, but sharers say partitions are pricey for the location.",
    businessBayReviews
  ),
  buildInsight(
    "bld-princess",
    "Princess Tower",
    "building",
    "Dubai",
    "One of Marina's busiest towers per community — crowded lifts, newer build, Indian/Filipino heavy, often called overpriced.",
    princessTowerReviews
  ),
  buildInsight(
    "bld-silverene",
    "Silverene Towers",
    "building",
    "Dubai",
    "Reviewers rate it as a newer, better-maintained Marina option — still pricey, moderate crowds, European and Filipino tenants mentioned.",
    silvereneReviews
  ),
  buildInsight(
    "bld-alkhail",
    "Al Khail Gate",
    "building",
    "Dubai",
    "Popular JLT building with fair-value mentions — mixed nationalities, moderate density, relatively new stock.",
    alKhailReviews
  ),
];

export const areaInsights: AreaInsight[] = rawInsights;

export function getAreaInsightByName(name: string): AreaInsight | undefined {
  const norm = name.trim().toLowerCase();
  return areaInsights.find((a) => a.name.toLowerCase() === norm);
}

export function getAreaInsightById(id: string): AreaInsight | undefined {
  return areaInsights.find((a) => a.id === id);
}

export function getInsightsForEmirate(emirate: string): AreaInsight[] {
  return areaInsights.filter((a) => a.emirate === emirate);
}
