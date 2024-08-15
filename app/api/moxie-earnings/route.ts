import { init, fetchQuery } from "@airstack/node";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.AIRSTACK_API_KEY;
if (!apiKey) {
  throw new Error("AIRSTACK_API_KEY is not defined");
}
init(apiKey);

console.log("Airstack API initialized for Moxie earnings");

const moxieQuery = `
query MyQuery($entityId: String!, $timeframe: FarcasterMoxieEarningStatsTimeframe!) {
  FarcasterMoxieEarningStats(
    input: {filter: {entityType: {_eq: USER}, entityId: {_eq: $entityId}}, timeframe: $timeframe, blockchain: ALL}
  ) {
    FarcasterMoxieEarningStat {
      allEarningsAmount
      frameDevEarningsAmount
      entityId
      entityType
      castEarningsAmount
      otherEarningsAmount
    }
  }
}
`;

export async function GET(req: NextRequest) {
  console.log(`Moxie earnings API route called at ${new Date().toISOString()}`);
  console.log(`Full URL: ${req.url}`);

  const entityId = req.nextUrl.searchParams.get("entityId");
  console.log(`Requested entityId: ${entityId}`);

  if (!entityId) {
    console.log("Error: entityId parameter is missing");
    return NextResponse.json(
      { error: "entityId parameter is required" },
      { status: 400 }
    );
  }

  try {
    var todayEarnings: any, weeklyEarnings: any, lifetimeEarnings: any = {
      allEarningsAmount: 0,
      frameDevEarningsAmount: 0,
      entityId: entityId,
      entityType: "USER",
      castEarningsAmount: 0,
      otherEarningsAmount: 0
    };

    console.log(
      `Fetching Today's Moxie earnings data from Airstack for entityId: ${entityId}`
    );

    const [todayData] = await Promise.all([
      fetchQuery(moxieQuery, { entityId, timeframe: "TODAY" }),
    ]);

    if (todayData.error) {
      console.log(
        `Error fetching Today's Moxie earnings data from Airstack for entityId: ${entityId} with error: ${todayData.error}`
      );
    } else {
      console.log("Airstack API response (Today's Moxie earnings data - inside )):",JSON.stringify( {today: todayData.data,},null,2));
      console.log("1. is var null? ",JSON.stringify( {today: todayData.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat==null, },null,2));
      
      if (!(todayData.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat == null) && todayData.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat && todayData.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat.length > 0) {
        todayEarnings = todayData.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat[0];
      }
    }

    console.log(
      "Airstack API response (Today's Moxie earnings data):",
      JSON.stringify(
        {
          today: <JSON>todayEarnings,
        },
        null,
        2
      )
    );

    console.log(
      `Fetching Weekly Moxie earnings data from Airstack for entityId: ${entityId}`
    );
    const [weeklyData] = await Promise.all([
      fetchQuery(moxieQuery, { entityId, timeframe: "WEEKLY" }),
    ]);

    if (weeklyData.error) {
      console.log(
        `Error fetching Weekly Moxie earnings data from Airstack for entityId: ${entityId} with error: ${weeklyData.error}`
      );
    } else {
      if (weeklyData.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat && weeklyData.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat.length > 0) {
        weeklyEarnings = weeklyData.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat[0];
      }
    }

    console.log(
      "Airstack API response (Weekly Moxie earnings data):",
      JSON.stringify(
        {
          weekly: weeklyEarnings,
        },
        null,
        2
      )
    );

    console.log(
      `Fetching Lifetime Moxie earnings data from Airstack for entityId: ${entityId}`
    );
    const [lifetimeData] = await Promise.all([
      fetchQuery(moxieQuery, { entityId, timeframe: "LIFETIME" }),
    ]);

    if (lifetimeData.error) {
      console.log(
        `Error fetching Lifetime Moxie earnings data from Airstack for entityId: ${entityId} with error: ${lifetimeData.error}`
      );
    } else {
      if (lifetimeData.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat && lifetimeData.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat.length > 0) {
        lifetimeEarnings = lifetimeData.data.FarcasterMoxieEarningStats.FarcasterMoxieEarningStat[0];
      }
    }

    console.log(
      "Airstack API response (Lifetime Moxie earnings data):",
      JSON.stringify(
        {
          lifetime: lifetimeEarnings,
        },
        null,
        2
      )
    );

    return NextResponse.json({
      today:
        todayEarnings,
      weekly:
        weeklyEarnings,
      lifetime:
        lifetimeEarnings,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
