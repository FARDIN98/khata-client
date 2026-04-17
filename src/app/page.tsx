import { fetchPublic } from "@/lib/public-api";
import { countByCategory } from "@/lib/category-map";
import { HomeNav } from "@/components/home/HomeNav";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFeaturedEvent, type DokanEvent } from "@/components/home/HomeFeaturedEvent";
import { HomeCategoryTiles } from "@/components/home/HomeCategoryTiles";
import { HomeUpcomingEvents } from "@/components/home/HomeUpcomingEvents";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeLoyaltyTiers } from "@/components/home/HomeLoyaltyTiers";
import { HomeFeaturedShops, type Dokan } from "@/components/home/HomeFeaturedShops";
import { HomeTestimonial } from "@/components/home/HomeTestimonial";
import { HomeDemoBlock } from "@/components/home/HomeDemoBlock";
import { HomeFooter } from "@/components/home/HomeFooter";

// Prevent build-time backend fetches on Vercel. Every request fetches fresh.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [shops, upcoming, featured] = await Promise.all([
    fetchPublic<Dokan[]>("/dokans"),
    fetchPublic<DokanEvent[]>("/dokan-events?upcoming=true"),
    fetchPublic<DokanEvent[]>("/dokan-events?upcoming=true&featured=true"),
  ]);

  const shopList = shops ?? [];
  const upcomingList = upcoming ?? [];
  const featuredEvent = featured?.[0] ?? null;

  // Drop the featured event from the upcoming strip so it doesn't appear twice.
  const upcomingFiltered = featuredEvent
    ? upcomingList.filter((e) => e.id !== featuredEvent.id).slice(0, 9)
    : upcomingList.slice(0, 9);

  const categoryCounts = countByCategory(shopList);

  return (
    <>
      <HomeNav />
      <main className="flex-1">
        <HomeHero />
        <HomeFeaturedEvent event={featuredEvent} />
        <HomeCategoryTiles counts={categoryCounts} />
        <HomeUpcomingEvents events={upcomingFiltered} />
        <HomeHowItWorks />
        <HomeLoyaltyTiers />
        <HomeFeaturedShops shops={shopList} />
        <HomeTestimonial />
        <HomeDemoBlock />
      </main>
      <HomeFooter />
    </>
  );
}
