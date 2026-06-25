import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

const CACHE_KEY = "remote-jobs"
const CACHE_TTL_MS = 15 * 60 * 1000
const JOBICY_URL = "https://jobicy.com/api/v2/remote-jobs"

async function readCache(): Promise<{ data: any; timestamp: number } | null> {
  try {
    const entry = await db.cacheEntry.findUnique({ where: { key: CACHE_KEY } })
    if (!entry) return null
    return { data: entry.data, timestamp: entry.createdAt.getTime() }
  } catch {
    return null
  }
}

async function writeCache(data: any) {
  try {
    await db.cacheEntry.upsert({
      where: { key: CACHE_KEY },
      update: { data: data as any, createdAt: new Date(), expiresAt: new Date(Date.now() + CACHE_TTL_MS) },
      create: { key: CACHE_KEY, data: data as any, expiresAt: new Date(Date.now() + CACHE_TTL_MS) },
    })
  } catch {}
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = searchParams.get("count") || "20"
  const geo = searchParams.get("geo") || ""
  const industry = searchParams.get("industry") || ""
  const tag = searchParams.get("tag") || ""

  const cached = await readCache()
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    let jobs = cached.data as any[]
    if (tag) jobs = jobs.filter((j: any) => (j.jobTitle + " " + j.jobDescription).toLowerCase().includes(tag.toLowerCase()))
    if (geo) jobs = jobs.filter((j: any) => j.jobGeo?.toLowerCase().includes(geo.toLowerCase()))
    if (industry) jobs = jobs.filter((j: any) => j.jobIndustry?.toLowerCase().includes(industry.toLowerCase()))
    return NextResponse.json({
      jobs: jobs.slice(0, parseInt(count)),
      source: "cache",
      cachedAt: new Date(cached.timestamp).toISOString(),
      total: jobs.length,
    })
  }

  try {
    const url = `${JOBICY_URL}?count=${count}${geo ? `&geo=${geo}` : ""}${industry ? `&industry=${industry}` : ""}${tag ? `&tag=${tag}` : ""}`
    const res = await fetch(url, { next: { revalidate: 900 } })
    if (!res.ok) throw new Error(`Jobicy returned ${res.status}`)
    const data = await res.json()
    const jobs = data.jobs || data || []
    await writeCache(jobs)
    return NextResponse.json({ jobs, source: "live", total: jobs.length })
  } catch {
    const cached = await readCache()
    if (cached) {
      return NextResponse.json({
        jobs: cached.data,
        source: "cache",
        cachedAt: new Date(cached.timestamp).toISOString(),
        total: (cached.data as any[]).length,
      })
    }
    return NextResponse.json({ jobs: [], source: "none", total: 0 })
  }
}
