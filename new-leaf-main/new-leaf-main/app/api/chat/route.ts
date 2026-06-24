import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are New Leaf, a compassionate AI assistant that helps people in crisis find community support services anywhere in the world. Your role is to listen with empathy, understand their specific situation, and provide personalized, actionable guidance that is correct for the country and region they are actually in.

LOCATION HANDLING — READ THIS FIRST:
- The user's location (if provided) will be given to you as context (e.g. "My location context is: Austin, Texas" or "My location context is: Mumbai, India"). Treat this as the single most important fact for choosing which resources to recommend.
- Determine the COUNTRY first, then the state/region/city. Resource sets differ enormously by country — never default to US programs and numbers for a non-US location.
- If the location is in the United States: use 211, 988, SNAP, HUD, LIHEAP, etc. as listed below, and tailor to the specific state/city when you can (e.g. mention the relevant state Medicaid/SNAP agency, or known city-level resources, when you're confident they're accurate).
- If the location is outside the United States: do NOT mention 211, 988, SNAP, HUD, or other US-only programs as if they apply. Instead, draw on your knowledge to provide that country's actual equivalents — e.g. for India: 112 (national emergency number), Vandrevala Foundation (1860-2662-345) or iCall for mental health, NIMHANS helpline, local Public Distribution System (PDS/ration shops) for food, state-run shelters; for the UK: 999/111, Samaritans (116 123), Shelter England, Citizens Advice; and so on for other countries. Use the closest correct national/regional equivalents for: emergency services, a mental health crisis line, food assistance, housing/shelter assistance, and financial aid.
- If you are not confident about the correct local resource for a given country or region, say so honestly rather than inventing a name or number — suggest the person search for "[their country] + [need, e.g. housing assistance]" or contact a local government social services office, library, or community/religious organization, rather than substituting a US resource.
- If no location has been shared yet, note you can give much more specific guidance once they share their city/country, and keep your default guidance generic/international rather than assuming the US.

CORE BEHAVIORS:
1. Always acknowledge the person's feelings first with genuine warmth. They may be scared, frustrated, or exhausted.
2. If location isn't mentioned, ask for or note you can use their city/country to localize resources.
3. Provide concrete, actionable steps — not vague suggestions — using resources that actually exist where they live.
4. For the US: recommend 211. For other countries: recommend the closest local equivalent referral service, or a national government social services helpline if you know one, or 211-style local council/municipal office.
5. For mental health crises: prominently surface 988 (US) or the correct national crisis line for their country.
6. For housing emergencies: include the relevant national/local housing authority or shelter network for their country.
7. For food insecurity: include SNAP/EBT/food banks (US) or the equivalent local food assistance/ration system for their country.
8. Clearly note when information may need verification — this matters even more for non-US/lesser-known local resources.

RESPONSE FORMAT — use this exact markdown structure every time:

## I Hear You
[2-3 sentences of specific, empathetic acknowledgment. Reference their actual situation, not generic platitudes. Be warm but not patronizing.]

## Your Action Plan
[Numbered list of 3-5 concrete steps to take TODAY or this week, in priority order. Be specific — name the actual program, hotline, or office to contact.]

## Resources for You

### Emergency Lines — Always Available
[List the CORRECT emergency/crisis numbers for the user's actual country. For the US: 211 (local referral), 988 (crisis line), Crisis Text Line (text HOME to 741741), 911 (emergency). For other countries: the real national emergency number and the real national mental-health crisis line for that country if you know them — otherwise say honestly that you're not certain of the exact local hotline and recommend searching "[country] crisis helpline" or contacting local emergency services.]

### Housing [include only if relevant]
[List 2-4 specific national programs with real details]

### Food Assistance [include only if relevant]
[List 2-4 specific programs]

### Financial Help [include only if relevant]
[List 2-4 programs]

### Mental Health [include only if relevant]
[List 2-4 resources]

### Medical [include only if relevant]
[List 2-4 resources]

### Legal Aid [include only if relevant]
[List 2-4 resources]

---

*All information should be verified with official sources, as program details and availability change. Your local 211 operator can confirm current availability in your area.*

[End with one sentence of genuine encouragement — specific to their situation.]

NATIONAL PROGRAMS YOU SHOULD KNOW (UNITED STATES ONLY — only use these if the user's location is in the US; never present these as applicable to other countries):
- SNAP (food stamps): apply at snap.fns.usda.gov or local SNAP office; typically approved in 30 days, expedited in 7 days for urgent need
- WIC (Women, Infants, Children): wic.fns.usda.gov — formula, food, nutrition for pregnant/nursing moms and children under 5
- Section 8 / Housing Choice Voucher Program: contact local Public Housing Authority at hud.gov/topics/housing_choice_voucher_program_section_8
- Emergency rental assistance: contact 211 for local programs; also look at nlihc.org/rental-assistance
- LIHEAP (energy/utility help): liheap.acf.hhs.gov — prevents utility shutoffs
- Medicaid/CHIP: healthcare.gov — free/low-cost health coverage based on income
- Community Health Centers: findahealthcenter.hrsa.gov — sliding-scale free clinics
- Food banks: feedingamerica.org/find-your-local-foodbank — find nearest pantry
- Legal aid: lawhelp.org — free legal services by state
- Benefits.gov — find all federal assistance programs you may qualify for
- 211: single most important number — connects to local social services network
- National Domestic Violence Hotline: 1-800-799-7233 (SAFE) or text START to 88788
- Veterans Crisis Line: 988 then press 1, or text 838255
- SAMHSA (substance use): 1-800-662-4357

CRITICAL RULES:
- NEVER use emojis anywhere in your response, including in section headers. Use plain text headers only (e.g. "Emergency Lines", not "🆘 Emergency Lines"). This applies to the entire response, not just headers.
- NEVER provide specific legal, medical, or financial advice
- NEVER tell someone to avoid seeking professional help
- NEVER recommend a US-only program or number (211, 988, SNAP, HUD, etc.) to someone located outside the United States — use that country's real equivalents instead, or be honest that you're not certain of the exact local resource
- ALWAYS surface emergency resources prominently when situation is urgent, using the numbers correct for the user's actual country
- Be specific about program names, not just vague categories
- If you don't know local resources for their exact area or country, direct to the nearest equivalent of a general social services hotline and be honest about the uncertainty rather than guessing or substituting a US resource
- Keep responses warm but organized — people in crisis need clear guidance, not walls of text
- If someone seems to be in immediate danger, prioritize their local emergency number and local crisis line above all else`;

export async function POST(request: NextRequest) {
  const { messages, location, intake, language } = await request.json() as {
    messages: { role: string; content: string }[];
    location?: string;
    language?: "en" | "es";
    intake?: {
      urgency?: string;
      householdSize?: string;
      hasChildren?: string;
      veteranOrDisability?: string;
      incomeBand?: string;
    };
  };

  const normalizedLocation = typeof location === "string" ? location.trim() : "";
  const normalizedLanguage = language === "es" ? "es" : "en";

  // Build a per-request context block and prepend it to the system prompt.
  // Putting this in the SYSTEM prompt (not just as a trailing user message)
  // gives it much stronger weight, so the model reliably changes its
  // resource recommendations based on location instead of defaulting to US programs.
  const contextLines: string[] = [];
  if (normalizedLocation) {
    contextLines.push(
      `USER LOCATION: ${normalizedLocation}. Identify the country (and state/region if given) from this and tailor every resource you mention to that specific place, per the LOCATION HANDLING rules above. Do not default to US programs unless this location is in the US.`
    );
  } else {
    contextLines.push(
      `USER LOCATION: not provided yet. Keep resource suggestions general/international and invite the user to share their city/country for specific local resources.`
    );
  }

  const intakeParts: string[] = [];
  if (intake?.urgency) intakeParts.push(`Urgency: ${intake.urgency}`);
  if (intake?.householdSize) intakeParts.push(`Household size: ${intake.householdSize}`);
  if (intake?.hasChildren) intakeParts.push(`Children in household: ${intake.hasChildren}`);
  if (intake?.veteranOrDisability) intakeParts.push(`Veteran/disability status: ${intake.veteranOrDisability}`);
  if (intake?.incomeBand) intakeParts.push(`Income range: ${intake.incomeBand}`);
  if (intakeParts.length) {
    contextLines.push(`INTAKE CONTEXT: ${intakeParts.join("; ")}. Use this to tailor resources and prioritize the action plan.`);
  }

  if (normalizedLanguage === "es") {
    contextLines.push("Respond fully in Spanish. Keep the response natural, clear, and culturally appropriate for the user's location.");
  }

  const dynamicSystemPrompt = `${SYSTEM_PROMPT}\n\n=== CURRENT REQUEST CONTEXT ===\n${contextLines.join("\n")}`;

  const apiKey = process.env.GROQ_API_KEY;
  const hasRealKey = apiKey && apiKey.startsWith("gsk_");

  if (!hasRealKey) {
    return getDemoResponse(messages, normalizedLocation);
  }

  const client = new Groq({ apiKey });

  try {
    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1800,
      messages: [
        { role: "system", content: dynamicSystemPrompt },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("429") || message.includes("quota") || message.includes("rate")) {
      return getDemoResponse(messages, normalizedLocation);
    }
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Very rough heuristic to flag likely non-US locations for demo mode, since
// there's no real model call here to do this intelligently. Demo mode can't
// know real local resources for arbitrary countries, so when it looks
// non-US, we say so honestly instead of pretending 211/988/SNAP apply.
const US_STATE_HINTS = [
  "texas", "tx", "california", "ca", "new york", "ny", "florida", "fl", "ohio", "illinois",
  "georgia", "pennsylvania", "north carolina", "michigan", "virginia", "washington",
  "arizona", "massachusetts", "tennessee", "indiana", "missouri", "maryland", "wisconsin",
  "colorado", "minnesota", "south carolina", "alabama", "louisiana", "kentucky", "oregon",
  "oklahoma", "connecticut", "utah", "nevada", "iowa", "kansas", "arkansas", "mississippi",
  "nebraska", "idaho", "hawaii", "maine", "vermont", "alaska", "wyoming", "montana",
  "usa", "united states", "u.s.",
];

function isLikelyUSLocation(location: string): boolean {
  if (!location) return true; // default demo content stays US-flavored if unknown
  const lower = location.toLowerCase();
  return US_STATE_HINTS.some(hint => lower.includes(hint));
}

function getDemoResponse(messages: { role: string; content: string }[], location: string) {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() ?? "";
  const usLocation = isLikelyUSLocation(location);

  let response = "";

  if (location && !usLocation) {
    response = buildInternationalDemoResponse(location);
  } else if (lastMsg.includes("rent") || lastMsg.includes("evict") || lastMsg.includes("housing") || lastMsg.includes("homeless") || lastMsg.includes("shelter") || lastMsg.includes("landlord")) {
    response = DEMO_HOUSING;
  } else if (lastMsg.includes("food") || lastMsg.includes("hungry") || lastMsg.includes("eat") || lastMsg.includes("snap") || lastMsg.includes("grocer") || lastMsg.includes("meal") || lastMsg.includes("feed") || lastMsg.includes("hunger")) {
    response = DEMO_FOOD;
  } else if (lastMsg.includes("mental") || lastMsg.includes("depress") || lastMsg.includes("anxi") || lastMsg.includes("suicid") || lastMsg.includes("overwhelm") || lastMsg.includes("crisis") || lastMsg.includes("harm") || lastMsg.includes("feel")) {
    response = DEMO_MENTAL;
  } else if (lastMsg.includes("job") || lastMsg.includes("unemploy") || lastMsg.includes("money") || lastMsg.includes("financial") || lastMsg.includes("debt") || lastMsg.includes("bill") || lastMsg.includes("utility") || lastMsg.includes("electric") || lastMsg.includes("shutoff") || lastMsg.includes("pay") || lastMsg.includes("income")) {
    response = DEMO_FINANCIAL;
  } else {
    response = location ? buildUSLocationGeneralDemo(location) : DEMO_GENERAL;
  }

  const encoder = new TextEncoder();
  const words = response.split(" ");
  let i = 0;

  const readable = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        if (i >= words.length) {
          clearInterval(interval);
          controller.close();
          return;
        }
        const chunk = (i > 0 ? " " : "") + words[i];
        controller.enqueue(encoder.encode(chunk));
        i++;
      }, 28);
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Demo-Mode": "true",
    },
  });
}

function buildUSLocationGeneralDemo(location: string): string {
  return DEMO_GENERAL.replace(
    "## I Hear You",
    `*(Demo mode — showing US-focused sample resources. For ${location}, the 211 operator can confirm exactly which local programs apply.)*\n\n## I Hear You`
  );
}

function buildInternationalDemoResponse(location: string): string {
  return `*(Demo mode — this app's built-in sample responses are US-focused, so for **${location}** they can't show real local resources yet. Connect a real Groq API key to get accurate, location-aware guidance for anywhere in the world.)*

## I Hear You

Whatever's going on for you in ${location}, it takes courage to reach out, and you deserve support that's actually relevant to where you live — not generic US numbers that won't work for you.

## Your Action Plan

1. **Search "[your city/country] + social services" or "[your city/country] + crisis helpline"** — this surfaces the real local government or NGO services for your area.
2. **Contact your local government's social welfare or municipal office** — most countries have a department handling housing, food, or financial assistance, even if it isn't a single hotline like the US's 211.
3. **Look for local NGOs and religious/community organizations** — in many countries these are the fastest way to get emergency food, shelter, or cash assistance.
4. **If this is a mental health emergency, contact your country's emergency number immediately** (e.g. 112 across the EU and India, 999 in the UK, 000 in Australia) — please don't wait on this if you're in danger.

## Resources for You

### Emergency Lines
- Your country's national emergency number (varies by country — e.g. 112, 999, 000, 911 depending on where you are)
- A local mental health crisis line, if one exists in your country — search "[your country] crisis helpline"

---

*This is a demo-mode placeholder, not real local guidance. Once a real Groq API key is configured, this assistant can use its own knowledge to name the actual crisis lines, housing authorities, and food assistance programs for ${location} specifically.*

You're not alone in this, and the right local resource is out there — please don't stop at this demo response.`;
}

const DEMO_HOUSING = `## I Hear You

Facing a housing crisis is one of the most frightening things a family can go through. The uncertainty of not knowing where you'll sleep or whether you'll be forced to leave your home is overwhelming, and the fact that you're reaching out and looking for help shows real strength. You don't have to navigate this alone.

## Your Action Plan

1. **Call 211 right now** — Dial or text 211 (free, 24/7) to speak with a local specialist who can connect you with emergency rental assistance, shelter, and legal aid in your specific area. This is the fastest path to local help.
2. **Contact your local Community Action Agency** — These federally funded agencies often have emergency rental assistance funds. Visit communityactionpartnership.com to find yours.
3. **Apply for Emergency Rental Assistance** — Many states still have ERA funds available. Visit your state's housing authority website or ask your 211 operator for current local programs.
4. **Reach out to local faith-based organizations** — Churches, mosques, and synagogues often run emergency assistance funds with less bureaucracy and faster turnaround.
5. **Know your legal rights** — Eviction is a legal process that takes weeks or months. Contact legal aid (lawhelp.org) for a free consultation — you may have more time and options than you realize.

## Resources for You

### Emergency Lines — Always Available
- **211** — Call or text 211, free 24/7 referral to local food, housing & crisis services
- **988** — Suicide & Crisis Lifeline, call or text, 24/7
- **Crisis Text Line** — Text HOME to 741741

### Housing
- **HUD Emergency Housing** — hud.gov or call 1-800-569-4287 for housing counseling
- **National Low Income Housing Coalition** — nlihc.org/rental-assistance for rental assistance programs by state
- **Salvation Army** — salvationarmyusa.org — emergency rental and utility assistance
- **Catholic Charities** — can assist regardless of faith, catholiccharitiesusa.org
- **2-1-1.org** — search your zip code for local emergency shelter and housing programs

### Financial Help
- **LIHEAP** — liheap.acf.hhs.gov — prevents utility shutoffs, may free up cash for rent
- **Benefits.gov** — Find all federal programs you may qualify for

---

*Verify program availability and eligibility by calling 211 or visiting official websites directly, as funding and availability change frequently.*

You are taking the right steps. Housing crises feel permanent but they rarely are — help exists, and you're already finding it.`;

const DEMO_FOOD = `## I Hear You

Not having enough food is a crisis that affects not just your body but your sense of security and dignity. Whether it's a temporary setback or something you've been managing for a while, you deserve to eat — and there are real programs designed exactly for situations like yours. Let's get you connected.

## Your Action Plan

1. **Call 211 today** — They can tell you the nearest food pantry with current hours, which may have food available this week or even today.
2. **Apply for SNAP (food stamps)** — If you haven't already, go to snap.fns.usda.gov to apply online. For urgent need, expedited benefits can arrive within 7 days.
3. **Find your nearest food bank** — Visit feedingamerica.org/find-your-local-foodbank and enter your zip code. Most require no proof of income and distribute weekly.
4. **Check for WIC if applicable** — If you're pregnant, nursing, or have children under 5, WIC provides groceries, formula, and nutrition support. Find offices at wic.fns.usda.gov.
5. **Look for community meal programs** — Many schools, libraries, and community centers offer free meals. Ask your 211 operator for locations near you.

## Resources for You

### Emergency Lines — Always Available
- **211** — Call or text 211, free 24/7 referral to local food & crisis services
- **988** — Suicide & Crisis Lifeline, call or text, 24/7
- **Crisis Text Line** — Text HOME to 741741

### Food Assistance
- **SNAP** — snap.fns.usda.gov — food assistance based on income; apply online in most states
- **Feeding America Food Banks** — feedingamerica.org — 60,000+ food pantries nationwide
- **WIC Program** — wic.fns.usda.gov — for women and children under 5
- **No Kid Hungry** — nokidhungry.org — summer meal sites and SNAP enrollment help
- **USDA Summer Food Service** — free meals for kids under 18 when school is out

### Financial Help
- **Benefits.gov** — Find all programs you qualify for, including cash assistance
- **LIHEAP** — liheap.acf.hhs.gov — reduces utility bills, freeing money for food

---

*Program details and pantry hours change — always call ahead or verify through 211.*

Going through this takes courage. Food assistance programs exist because communities look out for each other — please use them, that's exactly what they're there for.`;

const DEMO_MENTAL = `## I Hear You

What you're going through sounds incredibly heavy, and I want you to know that reaching out — even to an app — takes real courage. Feeling overwhelmed, anxious, or like you're not okay is real and valid, and you deserve support. You don't have to keep carrying this alone.

## Your Action Plan

1. **If you're in crisis right now, please call or text 988** — The Suicide & Crisis Lifeline is free, confidential, and available 24/7. Trained counselors answer, not machines.
2. **Text HOME to 741741** — The Crisis Text Line if you'd prefer to communicate by text. Just as confidential and supportive.
3. **Find a community mental health center** — These offer sliding-scale or free counseling. Search SAMHSA's locator at findtreatment.gov or call 1-800-662-4357.
4. **Check if you qualify for Medicaid** — Medicaid covers mental health services including therapy and medication. Apply at healthcare.gov even if you tried before — eligibility changes.
5. **Connect with NAMI** — The National Alliance on Mental Illness (nami.org or 1-800-950-6264) has free support groups, helplines, and resources for you and family.

## Resources for You

### Emergency Lines — Always Available
- **988** — Suicide & Crisis Lifeline — call or text, free, 24/7, English & Spanish
- **Crisis Text Line** — Text HOME to 741741, free 24/7
- **211** — Can connect you to local mental health crisis services
- **911** — If you or someone else is in immediate danger

### Mental Health
- **SAMHSA National Helpline** — 1-800-662-4357 (free, confidential, 24/7, treatment locator)
- **NAMI** — nami.org or 1-800-950-NAMI — support groups, family resources, peer counseling
- **Open Path Collective** — openpathcollective.org — therapy sessions for $30–$80 sliding scale
- **Psychology Today Therapist Finder** — therapists who accept sliding scale or Medicaid
- **BetterHelp** — betterhelp.com — online therapy, financial aid available

### Financial Help
- **Medicaid** — healthcare.gov — covers mental health services if you qualify
- **Community Mental Health Centers** — most offer sliding-scale fees down to $0

---

*If you feel you may harm yourself or others, please call 988 or 911 immediately — they are there for exactly this.*

Asking for help is the hardest and most important step — you've already done it. Please reach out to one of these resources today; people who care are ready to answer.`;

const DEMO_FINANCIAL = `## I Hear You

Financial pressure — especially when bills are piling up and you're not sure how to keep the lights on or put food on the table — creates a kind of constant, grinding stress that affects everything. It's exhausting, and it can feel like there's no way out. But there are real programs and real people ready to help you stabilize, and we can find them together.

## Your Action Plan

1. **Call 211 immediately** — A local specialist can match you to emergency financial assistance programs in your area that you may not know about, including utility help, food, and rent assistance.
2. **Apply for all federal benefits you may qualify for** — Visit benefits.gov and complete their screener to see what programs you're eligible for (SNAP, Medicaid, LIHEAP, housing assistance, etc.).
3. **Contact your local Community Action Agency** — Find at communityactionpartnership.com — these federally funded agencies provide emergency cash, utility help, and more.
4. **If unemployed, file for Unemployment Insurance immediately** — Visit your state's labor department website. Back-dating is sometimes possible if you delayed filing.
5. **Talk to a nonprofit credit counselor** — NFCC.org connects you with free, certified nonprofit credit and debt counselors who can negotiate with creditors on your behalf.

## Resources for You

### Emergency Lines — Always Available
- **211** — Call or text 211, free 24/7, connects to local emergency financial programs
- **988** — If financial stress is affecting your mental health, please reach out
- **Crisis Text Line** — Text HOME to 741741

### Financial Help
- **Benefits.gov** — benefits.gov — screener for all federal assistance programs
- **LIHEAP** — liheap.acf.hhs.gov — emergency utility bill assistance
- **Modest Needs** — modestneeds.org — grants for people just above the poverty line
- **Salvation Army** — salvationarmyusa.org — emergency financial assistance
- **NFCC** — nfcc.org or 1-800-388-2227 — free nonprofit credit counseling

### Food Assistance
- **SNAP** — snap.fns.usda.gov — reduces grocery costs immediately
- **Feeding America** — feedingamerica.org — free food from local pantries

### Housing
- **Emergency Rental Assistance** — ask 211 for local programs
- **HUD Housing Counseling** — 1-800-569-4287, free advice on your options

---

*Financial situations feel permanent but rarely are — connect with 211 today to start identifying which local programs can help within days, not weeks.*

You are not failing — you're up against a broken system, and you're smart enough to look for real solutions. Help is available, and you've already started finding it.`;

const DEMO_GENERAL = `## I Hear You

It takes courage to reach out when things feel difficult, and I'm glad you're here. Whatever you're going through, you don't have to figure it out alone — there are community resources, real people, and programs designed to help people navigate hard times. Let me help you find the right support.

## Your Action Plan

1. **Call 211 — your most important first step** — Dial or text 211 (free, 24/7) to speak with a trained local specialist. Tell them what's going on and they'll connect you with exactly the right local programs for your situation.
2. **Share more about what you're facing** — The more specific you can be with me (housing, food, finances, health, legal), the more targeted help I can point you toward. Feel free to describe your situation in more detail.
3. **Visit benefits.gov** — This federal site has a screener that identifies all programs you may qualify for — it takes about 10 minutes and covers everything from food assistance to housing support.
4. **Connect with a local Community Action Agency** — Find yours at communityactionpartnership.com. They have staff who can sit with you, understand your full situation, and help you access multiple programs at once.

## Resources for You

### Emergency Lines — Always Available
- **211** — Call or text 211, free 24/7 referral to local services (food, housing, crisis, utilities)
- **988** — Suicide & Crisis Lifeline — call or text, 24/7, if you're struggling emotionally
- **Crisis Text Line** — Text HOME to 741741, free 24/7 support
- **911** — For immediate physical danger

### Housing
- **HUD Housing Help** — hud.gov — emergency and affordable housing programs
- **211** — Ask specifically about emergency rent/utility assistance in your area

### Food Assistance
- **SNAP** — snap.fns.usda.gov — food assistance, apply online
- **Feeding America** — feedingamerica.org — find a local food bank near you

### Financial Help
- **Benefits.gov** — Comprehensive federal benefit screener
- **LIHEAP** — liheap.acf.hhs.gov — utility and energy bill assistance

### Mental & Emotional Support
- **NAMI** — nami.org or 1-800-950-6264 — mental health information and peer support
- **SAMHSA** — 1-800-662-4357 — substance use and mental health treatment locator

---

*All resource details should be verified directly — availability and eligibility change. Your 211 operator can confirm what's currently available in your area.*

You've already taken the hardest step by asking for help. Tell me more about your specific situation and I can give you a more personalized plan.`;