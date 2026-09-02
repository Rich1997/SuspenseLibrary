import { readFileSync, writeFileSync } from 'fs';

const DATA_FILE = 'src/data/playlist.json';

/**
 * Author rules mapping canonical (correct) author names
 * to any aliases, alternate spellings, or misspellings that might appear in titles or existing metadata.
 */
export const AUTHOR_RULES = [
  {
    name: 'Taradas Bandyopadhyay',
    matches: [
      'Taradas Bandyopadhyay',
      'Taradas Bandopadhyay',
      'তারাদাস বন্দ্যোপাধ্যায়',
    ]
  },
  {
    name: 'Sharadindu Bandyopadhyay',
    matches: [
      'Sharadindu Bandyopadhyay',
      'Sharadindu Bandhopadhyay',
      'Saradindu Bandhopadhyay',
      'Saradindu Bandyopadhyay',
      'Saradindu Bondopadhyay',
      'Sharadindu Bondopadhyay',
      'Saradindu Bandopadhyay',
      'Saradindu Bandyopadhay',
      'Sarandindu Bandopadhyay',
      'Shorodindu Bandopadhyay',
      'শরদিন্দু বন্দ্যোপাধ্যায়',
      'শরদিন্দু বন্দ্যোপাধ্যায়',
      'ব্যোমকেশ',
      'Baroda'
    ]
  },
  {
    name: 'Satyajit Ray',
    matches: [
      'Satyajit Ray',
      'Satyajit Roy',
      'সত্যজিৎ রায়',
      'Shonku',
      'Feluda'
    ]
  },
  {
    name: 'Premendra Mitra',
    matches: [
      'Premendra Mitra',
      'প্রেমেন্দ্র মিত্র'
    ]
  },
  {
    name: 'Shirshendu Mukhopadhyay',
    matches: [
      'Sirshendu Mukhopadhyay',
      'Sirshendu Mukherjee',
      'শীর্ষেন্দু মুখোপাধ্যায়',
      'Shirshendu Mukhopadhyay'
    ]
  },
  {
    name: 'Bibhutibhushan Bandyopadhyay',
    matches: [
      'Bibhutibhushan Bandyopadhyay',
      'Bibhutibhushan Bandopadhyay',
      'Bibhutibhusan Bandyopadhyay',
      'বিভূতিভূষণ বন্দ্যোপাধ্যায়',
      'বিভূতিভূষণ বন্দ্যোপাধ্যায়'
    ]
  },
  {
    name: 'Sukumar Ray',
    matches: [
      'Sukumar Ray',
      'Sukumar Roy',
      'সুকুমার রায়',
    ]
  },
  {
    name: 'Sunil Gangopadhyay',
    matches: [
      'Sunil Gangopadhyay',
      'Sunil Ganguly',
      'Sunil Gangopadhay',
      'সুনীল গঙ্গোপাধ্যায়',
    ]
  },
  {
    name: 'Nihar Ranjan Gupta',
    matches: [
      'Nihar Ranjan Gupta',
      'নীহাররঞ্জন গুপ্ত',
      'নিহাররঞ্জন গুপ্ত',
      'Kiriti',
      'Niharranjan Gupta'
    ]
  },
  {
    name: 'Rabindranath Tagore',
    matches: [
      'Rabindranath Tagore',
      'Rabindranath Thakur',
      'রবীন্দ্রনাথ ঠাকুর',
    ]
  },
  {
    name: 'Hemendra Kumar Roy',
    matches: [
      'Hemendra Kumar Ray',
      'Hemendra Kumar Roy',
      'হেমেন্দ্রকুমার রায়',
      'হেমেন্দ্রকুমার রায়'
    ]
  },
  {
    name: 'Leela Majumdar',
    matches: [
      'Leela Majumdar'
    ]
  },
  {
    name: 'Rajshekhar Basu',
    matches: [
      'Rajshekhar Basu',
      'Rajeshekhar Basu',
      'Parashuram'
    ]
  },
  {
    name: 'Tarashankar Bandyopadhyay',
    matches: [
      'Tarashankar Bandyopadhyay',
      'Tarashankar Bandopadhyay'
    ]
  },
  {
    name: 'Tarapada Ray',
    matches: [
      'Tarapada Ray'
    ]
  },
  {
    name: 'Birendra Krishna Bhadra',
    matches: [
      'Birendra Krishna Bhadra'
    ]
  },
  {
    name: 'Humayun Ahmed',
    matches: [
      'Humayun Ahmed',
      'হুমাযূন আহমেদ',
    ]
  },
  {
    name: 'Arthur Conan Doyle',
    matches: [
      'Arthur Conan Doyle',
      'Conan Doyle',
      'Sherlock Holmes'
    ]
  },
  {
    name: 'Edgar Allan Poe',
    matches: [
      'Edgar Allan Poe',
      'Edgar Allen Poe',
      'Edgar Alan Poe'
    ]
  },
  {
    name: 'H. P. Lovecraft',
    matches: [
      'H. P. Lovecraft',
      'H.P. Lovecraft',
      'HP Lovecraft',
    ]
  },
  {
    name: 'Bram Stoker',
    matches: [
      'Bram Stoker',
    ]
  },
  {
    name: 'Agatha Christie',
    matches: [
      'Agatha Christie',
    ]
  },
  {
    name: 'Ruskin Bond',
    matches: [
      'Ruskin Bond',
    ]
  },
  {
    name: 'Alok Ghosh',
    matches: [
      'Alok Ghosh',
      'অলোক ঘোষ',
    ]
  },
  {
    name: "Syed Mustafa Siraj",
    matches: [
      'Syed Mustafa Siraj'
    ]
  },
  {
    name: 'Prafulla Roy',
    matches: [
      'Prafulla Roy',
      'প্রফুল্ল রায়'
    ]
  },
  {
    name: 'Abhigyan Ganguly',
    matches: [
      'Abhigyan Ganguly',
      'অভিজ্ঞান গাঙ্গুলী'
    ]
  },
  {
    name: 'Himadri Kishore Dasgupta',
    matches: [
      'Himadri Kishore Dasgupta',
      'হিমাদ্রি কিশোর দাশগুপ্ত',
      'হিমাদ্রিকিশোর দাশগুপ্ত'
    ]
  },
  {
    name: 'Sayak Aman',
    matches: [
      'Sayak Aman',
    ]
  },
  {
    name: 'Ajeyo Ray',
    matches: [
      'Ajeyo Ray',
    ]
  },
  {
    name: 'Kinnar Roy',
    matches: [
      'Kinnar Roy',
    ]
  },
  {
    name: 'Shamik Kumar Rakshit',
    matches: [
      'Shamik',
      'Shamik Kumar Rakshit',
    ]
  },
  {
    name: 'Rudyard Kipling',
    matches: [
      'Rudyard Kipling',
    ]
  },
  {
    name: 'Anirban Bhattacharya',
    matches: [
      'Anirban Bhattacharya',
    ]
  },
  {
    name: 'Dipanwita Roy',
    matches: [
      'Dipanwita Roy',
      'দীপান্বিতা রায়',
      'Diganta Deb'
    ]
  },
  {
    name: 'Anish Deb',
    matches: [
      'Anish Deb',
      'অনীশ দেব'
    ]
  },
  {
    name: 'Kaushik Ray',
    matches: [
      'Kaushik Ray',
      'Prokhor Rudra'
    ]
  },
  {
    name: 'Ranadip Nandy',
    matches: [
      'Ranadip Nandy',
    ]
  },
  {
    name: 'Saikat Mukhopadhyay',
    matches: [
      'Saikat Mukhopadhyay',
      'Saikat Mukhoapdhyay',
      'সৈকত মুখোপাধ্যায়',
      'Neel Chatterjee',
      'সৈকত মুখোপাধ্যায়'
    ]
  },
  {
    name: 'Baishali Dasgupta Nandi',
    matches: [
      'Baishali Dasgupta Nandi',
      'Baisali Dasgupta Nandi'
    ]
  },
  {
    name: 'Henry James',
    matches: [
      'Henry James',
    ]
  },
  {
    name: 'Manjil Sen',
    matches: [
      'Manjil Sen',
    ]
  },
  {
    name: 'Manoj Sen',
    matches: [
      'Manoj Sen'
    ]
  },
  {
    name: 'Nirban Roy',
    matches: [
      'Nirban Roy',
    ]
  },
  {
    name: 'Adrish Bardhan',
    matches: [
      'Adrish Bardhan',
    ]
  },
  {
    name: 'Abhijnan Roychowdhury',
    matches: [
      'Abhijnan Roychowdhury',
      'অভিজ্ঞান রায়চৌধুরী',
      'Abhijnan Roy Chowdhury',
      'Abhigyan Roychowdhury'
    ]
  },
  {
    name: 'Subhamanash Ghosh',
    matches: [
      'Subhamanash Ghosh',
    ]
  },
  {
    name: 'Souvik Guha Sarkar',
    matches: [
      'Souvik Guha Sarkar',
    ]
  },
  {
    name: 'Avik Sarkar',
    matches: [
      'Avik Sarkar'
    ]
  },
  {
    name: 'Debarati Mukhopadhyay',
    matches: [
      'Debarati Mukhopadhyay',
      'দেবারতি মুখোপাধ্যায়'
    ]
  },
  {
    name: 'Suparna Nath',
    matches: [
      'Suparna Nath',
    ]
  },
  {
    name: 'Manish Mukhopadhyay',
    matches: [
      'Manish Mukhopadhyay'
    ]
  },
  {
    name: 'Abhirup Sarkar',
    matches: [
      'Abhirup Sarkar',
      'অভিরূপ সরকার'
    ]
  },
  {
    name: 'M. R. James',
    matches: [
      'M. R. James',
      'M.R. James',
      'MR James'
    ]
  },
  {
    name: 'Ulric Daubeny',
    matches: [
      'Ulric Daubeny',
    ]
  },
  {
    name: 'Sanjay Bhattacharya',
    matches: [
      'Sanjay Bhattacharya',
      'সঞ্জয় ভট্টাচার্য'
    ]
  },
  {
    name: 'H. G. Wells',
    matches: [
      'H. G. Wells',
      'H.G. Wells',
      'HG Wells'
    ]
  },
  {
    name: 'Jaydip Chakraborty',
    matches: [
      'Jaydip Chakraborty',
      'জয়দীপ চক্রবর্তী'
    ]
  },
  {
    name: 'Dinesh Chandra Chattopadhyay',
    matches: [
      'Dinesh Chandra Chattopadhyay',
      'দীনেশচন্দ্র চট্টোপাধ্যায়'
    ]
  },
  {
    name: 'Kallol Lahiri',
    matches: [
      'Kallol Lahiri'
    ]
  },
  {
    name: 'Hector Hugh Munro',
    matches: [
      'Hector Hugh Munro',
      'Saki'
    ]
  },
  {
    name: 'Narayan Gangopadhyay',
    matches: [
      'Narayan Gangopadhyay'
    ]
  },
  {
    name: 'Charles Dickens',
    matches: [
      'Charles Dickens'
    ]
  },
  {
    name: 'Rohan Roy',
    matches: [
      'Rohan Roy'
    ]
  },
  {
    name: 'Trinankur Banerjee',
    matches: [
      'Trinankur Banerjee'
    ]
  },
  {
    name: 'Ayan Raha',
    matches: [
      'Ayan Raha',
    ]
  },
  {
    name: 'Sailajananda Mukhopadhyay',
    matches: [
      'Sailajananda Mukhopadhyay',
      'Shailajananda Mukhopadhyay'
    ]
  },
  {
    name: 'Jim Corbett',
    matches: [
      'Jim Corbett'
    ]
  },
  {
    name: 'Pranab Roy',
    matches: [
      'Pranab Roy'
    ]
  },
  {
    name: 'Abhik Dutta',
    matches: [
      'Abhik Dutta'
    ]
  },
  {
    name: 'E. F. Benson',
    matches: [
      'E. F. Benson',
      'E.F. Benson'
    ]
  },
  {
    name: 'Supratim Sarkar',
    matches: [
      'Supratim Sarkar',
      'Goyendapeeth Lalbazar'
    ]
  },
  {
    name: 'J. Sheridan Le Fanu',
    matches: [
      'J. Sheridan Le Fanu',
      'J.Sheridan Le Fanu'
    ]
  },
  {
    name: 'G. K. Chesterton',
    matches: [
      'G.K. Chesterton',
      'G. K. Chesterton',
      'G.K.Chesterton'
    ]
  },
  {
    name: 'Harinarayan Chattopadhyay',
    matches: [
      'Harinarayan Chattopadhyay',
    ]
  },
  {
    name: 'Soumitra Biswas',
    matches: [
      'Soumitra Biswas',
    ]
  },
  {
    name: 'Abhinandan Banerjee',
    matches: [
      'Abhinandan Banerjee',
      'Abhinandan Bandyopadhyay'
    ]
  },
  {
    name: 'Pracheta Gupta',
    matches: [
      'Pracheta Gupta'
    ]
  },
  {
    name: 'Panchkari Dey',
    matches: [
      'Panchkari Dey',
      'Pachkari Dey',
      'Panchkori Dey'
    ]
  },
  {
    name: 'Manik Bandyopadhyay',
    matches: [
      'Manik Bandyopadhyay'
    ]
  },
  {
    name: 'Smaranjit Chakraborty',
    matches: [
      'Smaranjit Chakraborty'
    ]
  },
  {
    name: 'Mriganka Bhattacharya',
    matches: [
      'Mriganka Bhattacharya'
    ]
  },
  {
    name: 'Caesar Bagchi',
    matches: [
      'Caesar Bagchi'
    ]
  },
  {
    name: 'Hindol Sarkar',
    matches: [
      'Hindol Sarkar'
    ]
  },
  {
    name: 'Lew Wallace',
    matches: [
      'Lew Wallace'
    ]
  },
  {
    name: 'Samaresh Majumdar',
    matches: [
      'Samaresh Majumdar'
    ]
  },
  {
    name: 'Anuva Nath',
    matches: [
      'Anuva Nath',
      'Anubha Nath'
    ]
  },
  {
    name: 'Bankim Chandra Chattopadhyay',
    matches: [
      'Bankim Chandra Chattopadhyay'
    ]
  },
  {
    name: 'Rajarshee Gupta',
    matches: [
      'Rajarshee Gupta'
    ]
  },
  {
    name: 'Alexandre Dumas',
    matches: [
      'Alexandre Dumas'
    ]
  },
  {
    name: 'Gajendrakumar Mitra',
    matches: [
      'Gajendrakumar Mitra',
      'Gajendra Kumar Mitra'
    ]
  },
  {
    name: 'Shamita Das Dasgupta',
    matches: [
      'Shamita Das Dasgupta'
    ]
  },
  {
    name: 'Arup Kumar Dutta',
    matches: [
      'Arup Kumar Dutta'
    ]
  },
  {
    name: 'Jagadish Gupta',
    matches: [
      'Jagadish Gupta'
    ]
  },
  {
    name: 'Mohammed Alomgir Toimoor',
    matches: [
      'Mohammed Alomgir Toimoor',
      'Md. Alamgir Toimoor',
    ]
  },
  {
    name: 'Robert Louis Stevenson',
    matches: [
      'Robert Louis Stevenson'
    ]
  },
  {
    name: 'Amelia B. Edwards',
    matches: [
      'Amelia B. Edwards'
    ]
  },
  {
    name: 'Ambrose Bierce',
    matches: [
      'Ambrose Bierce'
    ]
  },
  {
    name: 'O. Henry',
    matches: [
      'O. Henry',
      'O Henry'
    ]
  },
  {
    name: 'Sourav Mukhopadhyay',
    matches: [
      'Sourav Mukhopadhyay'
    ]
  },
  {
    name: 'Priyonath Mukhopadhyay',
    matches: [
      'Priyonath Mukhopadhyay',
      'Daroga Priyonath'
    ]
  },
  {
    name: 'Abhishek Sengupta',
    matches: [
      'Abhishek Sengupta'
    ]
  },
  {
    name: 'Nityananda Khan',
    matches: [
      'Nityananda Khan'
    ]
  },
  {
    name: 'Nirmal Kumar',
    matches: [
      'Nirmal Kumar'
    ]
  },
  {
    name: 'Nagendranath Gupta',
    matches: [
      'Nagendranath Gupta'
    ]
  },
  {
    name: 'Mithil Bhattacharya',
    matches: [
      'Mithil Bhattacharya'
    ]
  },
  {
    name: 'Manoranjan Dey',
    matches: [
      'Manoranjan Dey'
    ]
  },
  {
    name: 'Buddhadeva Bose',
    matches: [
      'Buddhadeva Bose',
      'Buddhadev Basu'
    ]
  },
  {
    name: 'Bimal Kar',
    matches: [
      'Bimal Kar'
    ]
  },
  {
    name: 'Nilanjan Chattopadhyay',
    matches: [
      'Nilanjan Chattopadhyay'
    ]
  },
  {
    name: 'F. Marion Crawford',
    matches: [
      'F. Marion Crawford'
    ]
  },
  {
    name: 'Alice Perrin',
    matches: [
      'Alice Perrin'
    ]
  },
  {
    name: 'Samaresh Basu',
    matches: [
      'Samaresh Basu'
    ]
  },
  {
    name: 'Sasthipada Chattopadhyay',
    matches: [
      'Sasthipada Chattopadhyay'
    ]
  },
  {
    name: 'Achintya Kumar Sengupta',
    matches: [
      'Achintya Kumar Sengupta'
    ]
  },
  {
    name: 'Hanns Heinz Ewers',
    matches: [
      'Hanns Heinz Ewers'
    ]
  },
  {
    name: 'Pallab Halder',
    matches: [
      'Pallab Halder'
    ]
  },
  {
    name: 'Prabhat Kumar Mukhopadhyay',
    matches: [
      'Prabhat Kumar Mukhopadhyay'
    ]
  },
  {
    name: 'Stacy Aumonier',
    matches: [
      'Stacy Aumonier'
    ]
  },
  {
    name: 'Bidhayak Bhattacharya',
    matches: [
      'Bidhayak Bhattacharya'
    ]
  },
  {
    name: 'Murari Mohan Beet',
    matches: [
      'Murari Mohan Beet'
    ]
  },
  {
    name: 'W. W. Jacobs',
    matches: [
      'W. W. Jacobs',
      'W.W. Jacobs'
    ]
  },
  {
    name: 'Sujan Dasgupta',
    matches: [
      'Sujan Dasgupta'
    ]
  },
  {
    name: 'Souvik Chakraborty',
    matches: [
      'Souvik Chakraborty'
    ]
  },
  {
    name: 'Sheikh Sahebul Haque',
    matches: [
      'Sheikh Sahebul Haque'
    ]
  },
  {
    name: 'Indranil Sanyal',
    matches: [
      'Indranil Sanyal'
    ]
  },
  {
    name: 'Aritri Chatterjee',
    matches: [
      'Aritri Chatterjee'
    ]
  }
];

export function populateAuthors() {
  const raw = readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(raw);

  let updatedVideoCount = 0;
  let totalAuthorsAdded = 0;
  let correctedSpellingCount = 0;

  data.videos = data.videos.map((video) => {
    const title = video.title || '';
    let videoModified = false;
    let currentAuthors = video.authors || [];

    currentAuthors = currentAuthors.map((authorObj) => {
      const currentName = authorObj.name;
      for (const rule of AUTHOR_RULES) {
        const matchFound = rule.matches.some(
          (m) => m.toLowerCase() === currentName.toLowerCase()
        );
        if (matchFound && currentName !== rule.name) {
          correctedSpellingCount++;
          videoModified = true;
          return { ...authorObj, name: rule.name };
        }
      }
      return authorObj;
    });

    const existingAuthorNames = new Set(
      currentAuthors.map((a) => a.name.toLowerCase().trim())
    );

    for (const rule of AUTHOR_RULES) {
      if (existingAuthorNames.has(rule.name.toLowerCase())) {
        continue;
      }

      const matchedTitlePattern = rule.matches.some((pattern) =>
        title.toLowerCase().includes(pattern.toLowerCase())
      );

      if (matchedTitlePattern) {
        currentAuthors.push({
          role: 'author',
          name: rule.name,
        });
        existingAuthorNames.add(rule.name.toLowerCase());
        videoModified = true;
        totalAuthorsAdded++;
      }
    }

    if (videoModified) {
      updatedVideoCount++;
      video.authors = currentAuthors;
    }

    return video;
  });

  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  console.log(`\n--- Author Auto-Population Results ---`);
  console.log(`Videos updated: ${updatedVideoCount}`);
  console.log(`New author tags added: ${totalAuthorsAdded}`);
  console.log(`Existing author spellings corrected: ${correctedSpellingCount}`);
  console.log(`------------------------------------\n`);
}

populateAuthors();
