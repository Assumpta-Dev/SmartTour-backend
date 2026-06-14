import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../server/config/db';

async function main() {
  // ── Objects (NFC/QR tags) ────────────────────────────────────────────────────
  const objects = [
    { name: 'African Elephant',       type: 'animal',   description: 'The African elephant is the largest land animal on Earth. Adults can weigh up to 6,000 kg and live up to 70 years in the wild.',          latitude: -1.9441, longitude: 30.0619, nfcId: 'NFC-001', qrCode: 'QR-001' },
    { name: 'Grey Crowned Crane',     type: 'bird',     description: 'The national bird of Uganda. Known for its golden crown of feathers and elaborate courtship dance.',                                       latitude: -1.9445, longitude: 30.0623, nfcId: 'NFC-002', qrCode: 'QR-002' },
    { name: 'Ancient Mahogany Tree',  type: 'tree',     description: 'This African Mahogany is estimated to be over 80 years old. It provides habitat for over 12 bird species.',                              latitude: -1.945,  longitude: 30.063,  nfcId: 'NFC-003', qrCode: 'QR-003' },
    { name: 'Nile Crocodile Enclosure', type: 'animal', description: 'Home to three Nile crocodiles. The largest, nicknamed "Goliath", is over 4 metres long and estimated to be 45 years old.',               latitude: -1.9438, longitude: 30.0615, nfcId: 'NFC-004', qrCode: 'QR-004' },
    { name: 'Botanical Garden Entrance', type: 'landmark', description: 'Welcome to the botanical garden. This garden hosts over 200 plant species native to East Africa.',                                   latitude: -1.9435, longitude: 30.061,  nfcId: 'NFC-005', qrCode: 'QR-005' },
    { name: 'Mountain Gorilla Exhibit', type: 'animal', description: 'Mountain gorillas are critically endangered with fewer than 1,000 remaining in the wild. This exhibit educates visitors on conservation.', latitude: -1.946,  longitude: 30.064,  nfcId: 'NFC-006', qrCode: 'QR-006' },
  ];

  for (const obj of objects) {
    await prisma.object.upsert({ where: { qrCode: obj.qrCode }, update: obj, create: obj });
  }

  // ── Zones (geofencing) ───────────────────────────────────────────────────────
  const zones = [
    { zoneName: 'Entrance Gate',       radius: 50,  latitude: -1.9435, longitude: 30.061,  triggerAudio: 'Welcome to the Smart Tourism Park!' },
    { zoneName: 'Animal Zone',         radius: 100, latitude: -1.9441, longitude: 30.0619, triggerAudio: 'You are entering the animal zone. Please keep noise to a minimum.' },
    { zoneName: 'Botanical Garden',    radius: 80,  latitude: -1.945,  longitude: 30.063,  triggerAudio: 'Welcome to the botanical garden. Over 200 plant species await you.' },
    { zoneName: 'Gorilla Conservation', radius: 60, latitude: -1.946,  longitude: 30.064,  triggerAudio: 'You are entering the gorilla conservation area.' },
  ];

  for (const zone of zones) {
    const existing = await prisma.zone.findFirst({ where: { zoneName: zone.zoneName }, select: { id: true } });
    if (existing) await prisma.zone.update({ where: { id: existing.id }, data: zone });
    else          await prisma.zone.create({ data: zone });
  }

  // ── Locations ────────────────────────────────────────────────────────────────
  const locationData = [
    { name: 'Nyungwe National Park',   slug: 'nyungwe',   description: "Nyungwe National Park is one of Africa's oldest rainforests, covering 1,019 km\u00b2. Home to 13 primate species including chimpanzees and colobus monkeys.", latitude: -2.4833, longitude: 29.1833, featured: true },
    { name: 'Akagera National Park',   slug: 'akagera',   description: 'Akagera is a savanna park in eastern Rwanda offering classic African wildlife including the Big Five, hippos, and over 500 bird species.',              latitude: -1.8167, longitude: 30.7833, featured: true },
    { name: 'Volcanoes National Park', slug: 'volcanoes', description: "Home to endangered mountain gorillas and golden monkeys on the slopes of the Virunga volcanoes. Rwanda's most iconic wildlife destination.",             latitude: -1.4833, longitude: 29.5333, featured: true },
    { name: 'Nyandungu Urban Wetland', slug: 'nyandungu', description: 'An urban eco-park in Kigali built on a restored wetland. Features walking trails, birdwatching, and scenic greenery close to the city.',              latitude: -1.9403, longitude: 30.1218, featured: false },
    { name: 'Lake Kivu',               slug: 'lake-kivu', description: "One of Africa's Great Lakes, Lake Kivu borders Rwanda and the DRC. Known for beach resorts, kayaking, and scenic island tours.",                        latitude: -2.05,   longitude: 29.1167, featured: true },
  ];

  const locations: Record<string, number> = {};
  for (const loc of locationData) {
    const l = await prisma.location.upsert({ where: { slug: loc.slug }, update: loc, create: loc });
    locations[loc.slug] = l.id;
  }
  console.log('Locations seeded:', Object.keys(locations).length);

  // ── Categories ───────────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'Birds',       slug: 'birds',       icon: '\ud83e\udd9c' },
    { name: 'Animals',     slug: 'animals',     icon: '\ud83d\udc18' },
    { name: 'Trees',       slug: 'trees',       icon: '\ud83c\udf33' },
    { name: 'Plants',      slug: 'plants',      icon: '\ud83c\udf3a' },
    { name: 'Camping',     slug: 'camping',     icon: '\ud83c\udfd5' },
    { name: 'Hotels',      slug: 'hotels',      icon: '\ud83c\udfe8' },
    { name: 'Restaurants', slug: 'restaurants', icon: '\ud83c\udf7d' },
    { name: 'Activities',  slug: 'activities',  icon: '\ud83d\udeb6' },
    { name: 'Attractions', slug: 'attractions', icon: '\ud83d\udcf8' },
    { name: 'Waterfalls',  slug: 'waterfalls',  icon: '\ud83c\udfde' },
  ];

  const categories: Record<string, number> = {};
  for (const cat of categoryData) {
    const c = await prisma.category.upsert({ where: { slug: cat.slug }, update: cat, create: cat });
    categories[cat.slug] = c.id;
  }
  console.log('Categories seeded:', Object.keys(categories).length);

  // ── Items (features) ─────────────────────────────────────────────────────────
  const itemData = [
    { name: 'Great Blue Turaco',         slug: 'great-blue-turaco',         locationSlug: 'nyungwe',   categorySlug: 'birds',       description: "The Great Blue Turaco is the largest turaco species, known for its vibrant blue and green plumage. It inhabits the canopy of Nyungwe's dense rainforest.", habitat: 'Rainforest canopy', conservation: 'Least Concern', facts: 'Can grow up to 75 cm in length. Its calls resemble a low-pitched cow sound.',                             rating: 4.8, featured: true  },
    { name: 'Rwenzori Turaco',           slug: 'rwenzori-turaco',           locationSlug: 'nyungwe',   categorySlug: 'birds',       description: 'A striking bird with crimson wing patches found only in the Albertine Rift montane forests including Nyungwe.',                                          habitat: 'Montane forest',    conservation: 'Least Concern', facts: 'Endemic to the Albertine Rift. Often seen in fruiting fig trees.',                                            rating: 4.6, featured: false },
    { name: 'Chimpanzee Tracking',       slug: 'chimpanzee-tracking',       locationSlug: 'nyungwe',   categorySlug: 'activities',  description: "Track habituated chimpanzee groups through Nyungwe's forest trails. Rwanda's closest relative to humans — sharing 98.7% of our DNA.",                   habitat: undefined,           conservation: 'Endangered',    facts: 'Nyungwe hosts around 500 chimpanzees across several habituated groups.',                                      rating: 4.9, featured: true  },
    { name: 'Mountain Gorilla Trekking', slug: 'mountain-gorilla-trekking', locationSlug: 'volcanoes', categorySlug: 'activities',  description: 'Trek through bamboo forest to spend one hour with a habituated gorilla family. Fewer than 1,100 mountain gorillas remain in the wild.',                habitat: undefined,           conservation: 'Endangered',    facts: "Rwanda's gorilla families include Umubano, Agashya, and Hirwa groups.",                                      rating: 5.0, featured: true  },
    { name: 'African Elephant',          slug: 'african-elephant-akagera',  locationSlug: 'akagera',   categorySlug: 'animals',     description: 'African elephants were reintroduced to Akagera in 1975. The park now supports a healthy breeding population roaming the savanna and wetlands.',        habitat: 'Savanna and wetlands', conservation: 'Vulnerable',  facts: 'Adult bulls can weigh over 6,000 kg. Elephants consume up to 300 kg of vegetation daily.',                  rating: 4.7, featured: true  },
    { name: 'Grey Crowned Crane',        slug: 'grey-crowned-crane',        locationSlug: 'akagera',   categorySlug: 'birds',       description: "Rwanda's national bird, easily identified by its golden crown. Common in Akagera's wetlands and open grasslands.",                                    habitat: 'Wetlands and grasslands', conservation: 'Endangered', facts: 'One of only two crane species that can perch in trees. Listed as Endangered due to habitat loss.',           rating: 4.5, featured: false },
    { name: 'Canopy Walkway',            slug: 'canopy-walkway',            locationSlug: 'nyungwe',   categorySlug: 'attractions', description: "Nyungwe's famous 200-metre suspension bridge stretches 70 metres above the forest floor, offering panoramic views of the rainforest canopy.",        habitat: undefined,           conservation: undefined,       facts: 'One of only a few canopy walkways in Africa. Best visited early morning for primate sightings.',             rating: 4.9, featured: true  },
    { name: 'Kamiranzovu Waterfall',     slug: 'kamiranzovu-waterfall',     locationSlug: 'nyungwe',   categorySlug: 'waterfalls',  description: 'A breathtaking waterfall deep within Nyungwe forest, reached via a scenic 10 km hiking trail through pristine rainforest.',                           habitat: undefined,           conservation: undefined,       facts: 'The trail passes through elephant habitat and is one of the longer hikes in the park.',                      rating: 4.4, featured: false },
  ];

  for (const item of itemData) {
    const { locationSlug, categorySlug, ...rest } = item;
    const payload = { ...rest, locationId: locations[locationSlug], categoryId: categories[categorySlug] };
    await prisma.item.upsert({ where: { slug: item.slug }, update: payload, create: payload });
  }
  console.log('Items seeded:', itemData.length);

  // ── Admin ─────────────────────────────────────────────────────────────────────
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (username && password) {
    const hashed = await bcrypt.hash(password, 12);
    await prisma.admin.upsert({ where: { username }, update: { password: hashed }, create: { username, password: hashed } });
    console.log(`Admin seeded: ${username}`);
  }

  console.log('Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
