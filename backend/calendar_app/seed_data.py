"""
Seed data for Baali-Patro.

Crop phenology windows are based on MoALD "Statistical Information on
Nepalese Agriculture" sowing/harvest windows for the Terai belt and NARC
crop-production packages (see docs/DATA_SOURCES.md). Weeks are ISO
week-of-year. Small per-district offsets model the east→west monsoon
onset gradient (Rupandehi earliest, Kailali latest by ~1–2 weeks).

Design decision: phenology is expressed as compact stage SPANS per crop
(base template) + per-district week offset, then expanded to 52 rows at
seed time. Hand-maintaining 1,560 CSV rows is error-prone; a 40-line
template with agronomic citations is auditable. The expansion is
exported to data/calendar_master.csv so the CSV artefact still exists.
"""

DISTRICTS = [
    # slug, name_en, name_ne, province, lat, lng, week_offset (monsoon gradient)
    ("kailali", "Kailali", "कैलाली", "Sudurpashchim", 28.6870, 80.6480, 2),
    ("bardiya", "Bardiya", "बर्दिया", "Lumbini", 28.3102, 81.4279, 1),
    ("banke", "Banke", "बाँके", "Lumbini", 28.0500, 81.6167, 1),
    ("kapilvastu", "Kapilvastu", "कपिलवस्तु", "Lumbini", 27.5500, 83.0500, 0),
    ("rupandehi", "Rupandehi", "रुपन्देही", "Lumbini", 27.5285, 83.4463, 0),
]

CROPS = [
    # code, name_en, name_ne, icon (emoji keeps the frontend dependency-free)
    ("paddy", "Paddy", "धान", "🌾"),
    ("wheat", "Wheat", "गहुँ", "🌿"),
    ("maize", "Maize", "मकै", "🌽"),
    ("mustard", "Mustard", "तोरी", "🌼"),
    ("sugarcane", "Sugarcane", "उखु", "🎋"),
    ("potato", "Potato", "आलु", "🥔"),
]

# Stage spans: list of (start_week, end_week_inclusive, stage) in BASE weeks
# (Rupandehi/Kapilvastu reference). Weeks wrap over year boundary where needed.
# Sources: MoALD 2020/21 Terai crop calendars; NARC production packages.
CROP_TEMPLATES = {
    # Main-season paddy: nursery/land-prep Jun, transplant late Jun–Jul,
    # flowering Sep, harvest late Oct–Nov.
    "paddy": [
        (1, 21, "fallow"),
        (22, 24, "land-prep"),
        (25, 29, "sowing"),
        (30, 35, "vegetative"),
        (36, 39, "flowering"),
        (40, 43, "grain-fill"),
        (44, 47, "harvest"),
        (48, 52, "post-harvest"),
    ],
    # Wheat: sown Nov–early Dec after paddy, harvest Mar–Apr.
    "wheat": [
        (1, 4, "vegetative"),
        (5, 8, "flowering"),
        (9, 11, "grain-fill"),
        (12, 15, "harvest"),
        (16, 18, "post-harvest"),
        (19, 43, "fallow"),
        (44, 45, "land-prep"),
        (46, 49, "sowing"),
        (50, 52, "vegetative"),
    ],
    # Spring maize (dominant Terai season): sown Feb–Mar, harvest Jun.
    "maize": [
        (1, 5, "fallow"),
        (6, 7, "land-prep"),
        (8, 11, "sowing"),
        (12, 17, "vegetative"),
        (18, 20, "flowering"),
        (21, 23, "grain-fill"),
        (24, 26, "harvest"),
        (27, 29, "post-harvest"),
        (30, 52, "fallow"),
    ],
    # Mustard (toria): sown late Sep–Oct, harvest Jan–Feb.
    "mustard": [
        (1, 2, "grain-fill"),
        (3, 6, "harvest"),
        (7, 9, "post-harvest"),
        (10, 37, "fallow"),
        (38, 39, "land-prep"),
        (40, 42, "sowing"),
        (43, 46, "vegetative"),
        (47, 50, "flowering"),
        (51, 52, "grain-fill"),
    ],
    # Sugarcane: planted Feb–Mar (spring), ~10–12 month cycle, harvest Dec–Feb.
    "sugarcane": [
        (1, 5, "harvest"),
        (6, 7, "land-prep"),
        (8, 12, "sowing"),
        (13, 30, "vegetative"),
        (31, 48, "grain-fill"),   # cane maturation / sucrose accumulation
        (49, 52, "harvest"),
    ],
    # Potato: planted Oct–Nov, harvest Feb–Mar.
    "potato": [
        (1, 5, "grain-fill"),     # tuber bulking
        (6, 10, "harvest"),
        (11, 13, "post-harvest"),
        (14, 39, "fallow"),
        (40, 41, "land-prep"),
        (42, 45, "sowing"),
        (46, 52, "vegetative"),
    ],
}

# Bilingual risk notes per (crop, stage). Hand-authored Nepali (not MT).
RISK_NOTES = {
    ("paddy", "land-prep"): (
        "Prepare bunds and puddle fields; pre-monsoon showers can be erratic — keep nursery seedbeds on higher ground.",
        "आली मर्मत र खेत हिलाउने काम गर्नुहोस्; मनसुनअघिको वर्षा अनियमित हुनसक्छ — बीउ ब्याड अग्लो ठाउँमा राख्नुहोस्।",
    ),
    ("paddy", "sowing"): (
        "Transplant 20–25 day seedlings with monsoon onset; delayed monsoon may require supplemental irrigation.",
        "मनसुन सुरु भएसँगै २०–२५ दिनका बेर्ना रोप्नुहोस्; मनसुन ढिलो भए थप सिँचाइ आवश्यक पर्न सक्छ।",
    ),
    ("paddy", "vegetative"): (
        "Peak monsoon: watch for flooding in low fields and stem borer after heavy rain.",
        "मनसुनको चरम समय: होचा खेतमा डुबान र भारी वर्षापछि गवारो कीराको निगरानी गर्नुहोस्।",
    ),
    ("paddy", "flowering"): (
        "Critical water-sensitive stage — do not let fields dry; late-monsoon dry spells reduce grain set.",
        "पानीप्रति अति संवेदनशील चरण — खेत सुक्न नदिनुहोस्; मनसुन अन्त्यको खडेरीले दाना कम लाग्न सक्छ।",
    ),
    ("paddy", "grain-fill"): (
        "Post-monsoon rain and lodging risk; drain fields 10–15 days before expected harvest.",
        "मनसुनपछिको वर्षा र बाली ढल्ने जोखिम; कटानीको १०–१५ दिनअघि खेतको पानी निकास गर्नुहोस्।",
    ),
    ("paddy", "harvest"): (
        "Harvest at 20–22% grain moisture; unseasonal October–November rain can cause sprouting in stacked paddy.",
        "दाना २०–२२% चिस्यानमा कटानी गर्नुहोस्; कात्तिक–मंसिरको बेमौसमी वर्षाले थुपारेको धानमा टुसा उम्रन सक्छ।",
    ),
    ("wheat", "land-prep"): (
        "Prepare fields immediately after paddy harvest; residual moisture reduces first-irrigation need.",
        "धान कटानीलगत्तै खेत तयार गर्नुहोस्; बाँकी चिस्यानले पहिलो सिँचाइको आवश्यकता घटाउँछ।",
    ),
    ("wheat", "sowing"): (
        "Sow by early December — every week's delay after Mangsir cuts yield; use seed drill where available.",
        "मंसिरको सुरुसम्ममा छर्नुहोस् — त्यसपछिको हरेक हप्ताको ढिलाइले उत्पादन घट्छ; सम्भव भए सिड ड्रिल प्रयोग गर्नुहोस्।",
    ),
    ("wheat", "vegetative"): (
        "Cold spells and fog are common; irrigate at crown-root initiation (~21 days after sowing).",
        "शीतलहर र कुहिरो सामान्य हो; छरेको करिब २१ दिनपछि (मुख्य जरा बन्ने बेला) सिँचाइ गर्नुहोस्।",
    ),
    ("wheat", "flowering"): (
        "Watch for yellow rust after prolonged cool-humid weather; ensure irrigation at booting–heading.",
        "लामो चिसो-ओसिलो मौसमपछि पहेँलो सिन्दुरे रोगको निगरानी गर्नुहोस्; बाला निस्कने बेला सिँचाइ सुनिश्चित गर्नुहोस्।",
    ),
    ("wheat", "grain-fill"): (
        "Rising March temperatures can force early maturity; terminal heat is the main yield risk in the Terai.",
        "चैतको बढ्दो तापक्रमले बाली छिटो पाक्न सक्छ; अन्तिम चरणको गर्मी तराईमा उत्पादनको मुख्य जोखिम हो।",
    ),
    ("wheat", "harvest"): (
        "Harvest before pre-monsoon thunderstorms (Chaitra); hailstorm risk peaks in late March–April.",
        "मनसुनअघिको हावाहुरी (चैत) अघि कटानी गर्नुहोस्; चैत–वैशाखमा असिनाको जोखिम बढी हुन्छ।",
    ),
    ("maize", "land-prep"): (
        "Ensure good tilth for spring maize; residual winter moisture helps germination.",
        "वसन्ते मकैका लागि माटो राम्रोसँग बुझाउनुहोस्; हिउँदे चिस्यानले उमारमा मद्दत गर्छ।",
    ),
    ("maize", "sowing"): (
        "Sow when soil temperature is rising (Feb–Mar); protect seed from birds and cutworms.",
        "माटोको तापक्रम बढ्दै गर्दा (फागुन–चैत) छर्नुहोस्; चरा र फेदकटुवा कीराबाट बीउ जोगाउनुहोस्।",
    ),
    ("maize", "vegetative"): (
        "Pre-monsoon dry spells: irrigate at knee-high stage; fall armyworm scouting every week.",
        "मनसुनअघिको खडेरी: घुँडा उचाइमा सिँचाइ गर्नुहोस्; अमेरिकी फौजी कीराको साप्ताहिक निगरानी गर्नुहोस्।",
    ),
    ("maize", "flowering"): (
        "Tasseling–silking is the most drought-sensitive window; a single missed irrigation can halve yield.",
        "जुँगा निस्कने बेला खडेरीप्रति सबैभन्दा संवेदनशील समय हो; एक पटक सिँचाइ छुटे उत्पादन आधा घट्न सक्छ।",
    ),
    ("maize", "grain-fill"): (
        "Early monsoon storms can lodge tall crops; earth-up rows for anchorage.",
        "मनसुन सुरुका हुरीले अग्लो बाली ढाल्न सक्छ; बोटलाई माटो चढाउनुहोस्।",
    ),
    ("maize", "harvest"): (
        "Harvest before peak monsoon; dry cobs to below 14% moisture to avoid aflatoxin.",
        "मनसुन चरममा पुग्नुअघि भित्र्याउनुहोस्; ढुसी (एफ्लाटक्सिन) बाट जोगाउन घोगा १४% भन्दा कम चिस्यानसम्म सुकाउनुहोस्।",
    ),
    ("mustard", "land-prep"): (
        "Fine tilth needed for small seed; conserve residual monsoon moisture.",
        "सानो बीउका लागि मसिनो माटो चाहिन्छ; मनसुनको बाँकी चिस्यान जोगाउनुहोस्।",
    ),
    ("mustard", "sowing"): (
        "Sow late September–October with residual moisture; late sowing increases aphid exposure.",
        "असोज–कात्तिकमा बाँकी चिस्यानमै छर्नुहोस्; ढिलो छरे लाही कीराको प्रकोप बढ्छ।",
    ),
    ("mustard", "vegetative"): (
        "Thin to proper spacing; first irrigation ~30 days after sowing if no rain.",
        "उचित दूरीमा बोट पातलो पार्नुहोस्; वर्षा नभए छरेको करिब ३० दिनपछि पहिलो सिँचाइ गर्नुहोस्।",
    ),
    ("mustard", "flowering"): (
        "Aphid pressure peaks in cool foggy weather; avoid spraying during bee foraging hours.",
        "चिसो कुहिरो लाग्दा लाही कीराको प्रकोप बढ्छ; मौरी चर्ने समयमा विषादी नछर्नुहोस्।",
    ),
    ("mustard", "grain-fill"): (
        "Unseasonal winter rain causes pod shattering and disease; drain standing water quickly.",
        "बेमौसमी हिउँदे वर्षाले कोसा फुट्ने र रोग लाग्ने हुन्छ; जमेको पानी तुरुन्त निकास गर्नुहोस्।",
    ),
    ("mustard", "harvest"): (
        "Harvest when 75% pods turn yellow-brown; over-drying in field shatters seed.",
        "७५% कोसा पहेँलो-खैरो भएपछि काट्नुहोस्; खेतमै धेरै सुकाए बीउ झर्छ।",
    ),
    ("sugarcane", "land-prep"): (
        "Deep ploughing and furrow preparation; plan setts from disease-free nursery.",
        "गहिरो जोताइ र कुलेसो तयारी गर्नुहोस्; रोगमुक्त नर्सरीबाट बीउ टुक्रा (सेट) योजना गर्नुहोस्।",
    ),
    ("sugarcane", "sowing"): (
        "Plant three-bud setts Feb–Mar; irrigate immediately after planting in dry spring.",
        "फागुन–चैतमा तीन आँख्ला भएका टुक्रा रोप्नुहोस्; सुख्खा वसन्तमा रोपेलगत्तै सिँचाइ गर्नुहोस्।",
    ),
    ("sugarcane", "vegetative"): (
        "Tillering and grand growth through monsoon; earth-up and tie canes before storm season.",
        "मनसुनभर गाँज हाल्ने र तीव्र वृद्धि हुन्छ; हुरी मौसमअघि माटो चढाउने र उखु बाँध्ने काम गर्नुहोस्।",
    ),
    ("sugarcane", "grain-fill"): (
        "Sucrose accumulation improves with cool dry autumn; stop irrigation 2–3 weeks before harvest.",
        "चिसो सुख्खा शरदमा चिनीको मात्रा बढ्छ; कटानीको २–३ हप्ताअघि सिँचाइ रोक्नुहोस्।",
    ),
    ("sugarcane", "harvest"): (
        "Harvest Dec–Feb at peak sucrose; crush within 24–48 hours of cutting.",
        "चिनीको मात्रा उच्च हुँदा (पुस–माघ) कटानी गर्नुहोस्; काटेको २४–४८ घण्टाभित्र पेल्नुहोस्।",
    ),
    ("potato", "land-prep"): (
        "Prepare ridges after monsoon recedes; well-drained loose soil prevents tuber rot.",
        "मनसुन सकिएपछि ड्याङ बनाउनुहोस्; निकास राम्रो भएको खुकुलो माटोले दाना कुहिनबाट जोगाउँछ।",
    ),
    ("potato", "sowing"): (
        "Plant sprouted seed tubers Oct–Nov; soil moisture at planting is critical for uniform emergence.",
        "टुसा उम्रेका बीउ आलु कात्तिक–मंसिरमा रोप्नुहोस्; एकनासले उम्रन रोप्दा माटोको चिस्यान महत्वपूर्ण छ।",
    ),
    ("potato", "vegetative"): (
        "Earth-up twice; late blight risk spikes with fog and drizzle — prophylactic spray on forecast.",
        "दुई पटक माटो चढाउनुहोस्; कुहिरो र सिमसिम पानीले डढुवा रोगको जोखिम बढाउँछ — पूर्वानुमान हेरी अग्रिम छर्काव गर्नुहोस्।",
    ),
    ("potato", "grain-fill"): (
        "Tuber bulking: keep soil evenly moist; frost on clear January nights can scorch foliage.",
        "दाना बढ्ने बेला: माटो एकनासले ओसिलो राख्नुहोस्; माघको सफा रातको तुषारोले पात डढाउन सक्छ।",
    ),
    ("potato", "harvest"): (
        "Dehaulm 10–14 days before digging for skin set; cure in shade, never in direct sun.",
        "बोक्रा बस्नका लागि खन्नुभन्दा १०–१४ दिनअघि झ्याङ काट्नुहोस्; छहारीमा सुकाउनुहोस्, घाममा कहिल्यै होइन।",
    ),
}

GENERIC_NOTES = {
    "fallow": (
        "Field resting period — good time for green manuring, soil testing and bund repair.",
        "खेत बाँझो रहने समय — हरियो मल, माटो परीक्षण र आली मर्मतका लागि उपयुक्त समय।",
    ),
    "post-harvest": (
        "Dry, grade and store produce properly; hermetic bags reduce storage pest losses.",
        "उपज राम्ररी सुकाएर, छानेर भण्डारण गर्नुहोस्; हावा नछिर्ने बोराले भण्डारण कीराको क्षति घटाउँछ।",
    ),
}


def shift_week(week: int, offset: int) -> int:
    """Shift ISO week with wraparound in 1..52."""
    return ((week - 1 + offset) % 52) + 1


def expand_calendar():
    """Yield dicts: one row per (district, crop, week 1..52)."""
    for district in DISTRICTS:
        d_slug, offset = district[0], district[6]
        for code, *_ in CROPS:
            week_stage = {}
            for start, end, stage in CROP_TEMPLATES[code]:
                for w in range(start, end + 1):
                    week_stage[shift_week(w, offset)] = stage
            for w in range(1, 53):
                stage = week_stage.get(w, "fallow")
                notes = RISK_NOTES.get((code, stage)) or GENERIC_NOTES.get(stage, ("", ""))
                yield {
                    "district_slug": d_slug,
                    "crop_code": code,
                    "week_of_year": w,
                    "stage": stage,
                    "risk_notes_en": notes[0],
                    "risk_notes_ne": notes[1],
                }
