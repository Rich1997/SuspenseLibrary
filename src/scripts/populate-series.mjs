import { readFileSync, writeFileSync } from 'fs';

const DATA_FILE = 'src/data/playlist.json';

/**
 * Series rules mapping canonical series names
 * to any aliases, alternate spellings, or keywords in titles and descriptions.
 */
export const SERIES_RULES = [
  {
    name: 'Sunday Suspense Classics',
    matches: [
      'Sunday Suspense Classics'
    ]
  },
  {
    name: 'Sunday Suspense Originals',
    matches: [
      'Sunday Suspense Originals'
    ]
  },
  {
    name: 'New Taranath Tantrik',
    matches: [
      'New Taranath Tantrik'
    ]
  },
  {
    name: 'Taranath Tantrik',
    matches: [
      'Taranath Tantrik',
      'Taranath',
      'তারানাথ তান্ত্রিক',
      'তারানাথ',
    ],
    exclude: [
      'New Taranath Tantrik',
    ],
  },
  {
    name: 'Feluda',
    matches: [
      'Feluda',
      'ফেলুদা',
      'Prodosh Chandra Mitter',
      'Pradosh C Mitter',
    ],
  },
  {
    name: 'Byomkesh Bakshi',
    matches: [
      'Byomkesh Bakshi',
      'Byomkesh',
      'ব্যোমকেশ বক্সী',
      'ব্যোমকেশ',
    ],
  },
  {
    name: 'Baroda',
    matches: [
      'Baroda'
    ]
  },
  {
    name: 'Professor Shonku',
    matches: [
      'Professor Shonku',
      'Prof Shonku',
      'Professor Sonku',
      'Sonku',
      'প্রফেসর শঙ্কু',
      'শঙ্কু',
      'Shonku'
    ]
  },
  {
    name: 'Kakababu',
    matches: [
      'Kakababu',
      'কাকাবাবু',
      'Raja Roy Chowdhury',
    ],
  },
  {
    name: 'Tarini Khuro',
    matches: [
      'Tarini Khuro',
      'তারিণী খুড়ো',
      'তারিণী খুরো',
      'তারিণীখুড়ো',
      'Tarinikhuro'
    ]
  },
  {
    name: 'Sherlock Holmes',
    matches: [
      'Sherlock Holmes',
      'Sherlock',
      'শার্লক হোমস',
      'শার্লক'
    ]
  },
  {
    name: 'Kiriti Roy',
    matches: [
      'Kiriti Roy',
      'Kiriti',
      'কিরীটি রায়',
      'কিরীটি'
    ]
  },
  {
    name: 'Goyenda Shabor',
    matches: [
      'Goyenda Shabor',
      'Shabor Dasgupta',
      'গোয়েন্দা শবর',
      'শবর'
    ]
  },
  {
    name: 'Ghanada',
    matches: [
      'Ghanada',
      'ঘনাদা'
    ]
  },
  {
    name: 'Tenida',
    matches: [
      'Tenida',
      'টেনিদা'
    ]
  },
  {
    name: 'Hercule Poirot',
    matches: [
      'Hercule Poirot',
      'Poirot',
      'পোয়ারো'
    ]
  },
  {
    name: 'Col. Niladri Sarkar',
    matches: [
      'Colonel Niladri Sarkar',
      'Col Niladri Sarkar',
      'Niladri Sarkar',
      'কলোনেল নীলাদ্রি সরকার'
    ]
  },
  {
    name: 'Mitin Mashi',
    matches: [
      'Mitin Mashi',
      'মিটিন মাসি'
    ]
  },
  {
    name: 'Prokhor Rudra',
    matches: [
      'Prokhor Rudra',
      'প্রখর রুদ্র',
    ]
  },
  {
    name: 'Neel Chatterjee',
    matches: [
      'Neel Chatterjee'
    ]
  },
  {
    name: 'শরদিন্দু বন্দ্যোপাধ্যায় ঐতিহাসিক',
    matches: [
      'শরদিন্দু বন্দ্যোপাধ্যায় ঐতিহাসিক'
    ]
  },
  {
    name: 'Jadukar Satyacharan',
    matches: [
      'Jadukar Satyacharan',
      'জাদুকর সত্যচরণ'
    ]
  },
  {
    name: 'Goyendapeeth Lalbazar',
    matches: [
      'Goyendapeeth Lalbazar'
    ]
  },
  {
    name: 'Colonel',
    matches: [
      'Colonel'
    ]
  },
  {
    name: 'Father Brown',
    matches: [
      'Father Brown'
    ]
  },
  {
    name: 'Best of',
    matches: [
      'Best'
    ]
  },
  {
    name: 'Diganta Deb',
    matches: [
      'Diganta Deb',
      'দিগন্ত দেব'
    ]
  },
  {
    name: 'Ben-Hur',
    matches: [
      'Ben-Hur',
      'Ben Hur'
    ]
  },
  {
    name: 'Chanakya',
    matches: [
      'Chanakya',
      'চাণক্য সিরিজ'
    ]
  },
  {
    name: 'Sunday Nonsense',
    matches: [
      'Sunday Nonsense',
      'SundayNonsense'
    ]
  }
];

export function populateSeries() {
  const raw = readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(raw);

  let updatedVideoCount = 0;
  let totalSeriesAdded = 0;
  let correctedSpellingCount = 0;

  data.videos = data.videos.map((video) => {
    const title = video.title || '';
    let videoModified = false;
    let currentSeries = Array.isArray(video.series) ? video.series : [];

    // 1. Correct any existing misspelled or alias series names in metadata
    currentSeries = currentSeries.map((seriesName) => {
      for (const rule of SERIES_RULES) {
        const matchFound = rule.matches.some(
          (m) => m.toLowerCase() === seriesName.toLowerCase()
        );
        if (matchFound && seriesName !== rule.name) {
          correctedSpellingCount++;
          videoModified = true;
          return rule.name;
        }
      }
      return seriesName;
    });

    // Deduplicate existing series names
    const existingSeriesSet = new Set(
      currentSeries.map((s) => s.toLowerCase().trim())
    );

    // 2. Check title against series rules to populate missing series tags
    for (const rule of SERIES_RULES) {
      if (existingSeriesSet.has(rule.name.toLowerCase())) {
        continue; // Already has this canonical series
      }

      const matchedTitlePattern = rule.matches.some((pattern) =>
        title.toLowerCase().includes(pattern.toLowerCase())
      );

      const isExcluded = rule.exclude?.some((exPattern) =>
        title.toLowerCase().includes(exPattern.toLowerCase())
      );

      if (matchedTitlePattern && !isExcluded) {
        currentSeries.push(rule.name);
        existingSeriesSet.add(rule.name.toLowerCase());
        videoModified = true;
        totalSeriesAdded++;
      }
    }

    if (videoModified) {
      updatedVideoCount++;
      video.series = currentSeries;
    }

    return video;
  });

  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  console.log(`\n--- Series Auto-Population Results ---`);
  console.log(`Videos updated: ${updatedVideoCount}`);
  console.log(`New series tags added: ${totalSeriesAdded}`);
  console.log(`Existing series spellings corrected: ${correctedSpellingCount}`);
  console.log(`------------------------------------\n`);
}

populateSeries();
