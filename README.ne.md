# बाली-पात्रो 🌾

**पश्चिम नेपाल तराईका लागि द्विभाषिक (नेपाली / English) बाली–मौसम पात्रो** —
५ जिल्ला × ६ बाली × ५२ हप्ता, साथै ७ दिने मौसम पूर्वानुमान र खेती सल्लाह।

> Read in English: [README.md](README.md)

| | |
|---|---|
| **जिल्लाहरू** | कैलाली, बर्दिया, बाँके, कपिलवस्तु, रूपन्देही |
| **बालीहरू** | धान, गहुँ, मकै, तोरी, उखु, आलु |
| **ब्याकएन्ड** | Django 5 + DRF, PostgreSQL |
| **फ्रन्टएन्ड** | Next.js 14, next-intl, Tailwind CSS |
| **मौसम** | [Open-Meteo](https://open-meteo.com/) (निःशुल्क) |

## ✨ विशेषताहरू

- **५२-हप्ते बाली पात्रो** — जिल्ला र बाली अनुसार, वृद्धि चरणले रङ्गिएको
  हप्ता-पट्टी (जग्गा तयारी → बीउ/नर्सरी → रोपाइँ → वानस्पतिक → फूल फुल्ने →
  दाना भरिने → कटानी → कटानीपछि)।
- **तुलना दृश्य** — एउटै जिल्लामा दुई बाली सँगसँगै हेर्नुहोस्।
- **साप्ताहिक सल्लाह** — ७ दिने मौसम पूर्वानुमानका आधारमा
  (वर्षा ≥ ६०/२० मि.मि., गर्मी ≥ ३६ °से., चिसो ≤ ८ °से.) खेती सल्लाह।
- **पूर्ण द्विभाषिक** — `/ne` र `/en` मार्गहरू, हातले लेखिएको नेपाली।

## 🚀 आफ्नो कम्प्युटरमा चलाउने तरिका

### विकल्प क — Docker (सबैभन्दा सजिलो)

पहिले [Docker Desktop](https://www.docker.com/products/docker-desktop/)
इन्स्टल गर्नुहोस्, त्यसपछि:

```bash
git clone <repo-url>
cd baali-patro
docker compose up --build
```

त्यसपछि ब्राउजरमा खोल्नुहोस्:

- **एप**: http://localhost:3000 (नेभिगेसनबाट नेपाली/English फेर्न सकिन्छ)
- **API**: http://localhost:8000/api/v1/districts/

### विकल्प ख — म्यानुअल रूपमा चलाउने

आवश्यक: **Python 3.11+** र **Node.js 18+**

**टर्मिनल १ — Django API:**

```bash
cd baali-patro/backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_calendar
python manage.py generate_advisories   # इन्टरनेट चाहिन्छ
python manage.py runserver 0.0.0.0:8000
```

**टर्मिनल २ — Next.js फ्रन्टएन्ड:**

```bash
cd baali-patro/frontend
npm install
npm run dev
```

अब **http://localhost:3000** खोल्नुहोस्।

## ⚠️ अस्वीकरण

यो पात्रोमा समावेश तथ्याङ्क सार्वजनिक स्रोतहरूबाट तयार पारिएको **शैक्षिक
अनुमान** हो। खेतबारीमा निर्णय गर्नुअघि आफ्नो नजिकको **कृषि ज्ञान केन्द्र**सँग
अवश्य सल्लाह लिनुहोस्। मौसम तथ्याङ्क © [Open-Meteo](https://open-meteo.com/)।
