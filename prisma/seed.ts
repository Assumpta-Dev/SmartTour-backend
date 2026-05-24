import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../server/config/db';

async function main() {
  const objects = [
    {
      name: 'African Elephant',
      type: 'animal',
      description:
        'The African elephant is the largest land animal on Earth. Adults can weigh up to 6,000 kg and live up to 70 years in the wild.',
      latitude: -1.9441,
      longitude: 30.0619,
      nfcId: 'NFC-001',
      qrCode: 'QR-001',
    },
    {
      name: 'Grey Crowned Crane',
      type: 'bird',
      description:
        'The national bird of Uganda. Known for its golden crown of feathers and elaborate courtship dance.',
      latitude: -1.9445,
      longitude: 30.0623,
      nfcId: 'NFC-002',
      qrCode: 'QR-002',
    },
    {
      name: 'Ancient Mahogany Tree',
      type: 'tree',
      description:
        'This African Mahogany is estimated to be over 80 years old. It provides habitat for over 12 bird species.',
      latitude: -1.945,
      longitude: 30.063,
      nfcId: 'NFC-003',
      qrCode: 'QR-003',
    },
    {
      name: 'Nile Crocodile Enclosure',
      type: 'animal',
      description:
        'Home to three Nile crocodiles. The largest, nicknamed "Goliath", is over 4 metres long and estimated to be 45 years old.',
      latitude: -1.9438,
      longitude: 30.0615,
      nfcId: 'NFC-004',
      qrCode: 'QR-004',
    },
    {
      name: 'Botanical Garden Entrance',
      type: 'landmark',
      description:
        'Welcome to the botanical garden. This garden hosts over 200 plant species native to East Africa.',
      latitude: -1.9435,
      longitude: 30.061,
      nfcId: 'NFC-005',
      qrCode: 'QR-005',
    },
    {
      name: 'Mountain Gorilla Exhibit',
      type: 'animal',
      description:
        'Mountain gorillas are critically endangered with fewer than 1,000 remaining in the wild. This exhibit educates visitors on conservation efforts.',
      latitude: -1.946,
      longitude: 30.064,
      nfcId: 'NFC-006',
      qrCode: 'QR-006',
    },
  ];

  for (const object of objects) {
    await prisma.object.upsert({
      where: { qrCode: object.qrCode },
      update: object,
      create: object,
    });
  }

  const zones = [
    {
      zoneName: 'Entrance Gate',
      radius: 50,
      latitude: -1.9435,
      longitude: 30.061,
      triggerAudio: 'Welcome to the Smart Tourism Park!',
    },
    {
      zoneName: 'Animal Zone',
      radius: 100,
      latitude: -1.9441,
      longitude: 30.0619,
      triggerAudio:
        'You are entering the animal zone. Please keep noise to a minimum.',
    },
    {
      zoneName: 'Botanical Garden',
      radius: 80,
      latitude: -1.945,
      longitude: 30.063,
      triggerAudio:
        'Welcome to the botanical garden. Over 200 plant species await you.',
    },
    {
      zoneName: 'Gorilla Conservation',
      radius: 60,
      latitude: -1.946,
      longitude: 30.064,
      triggerAudio: 'You are entering the gorilla conservation area.',
    },
  ];

  for (const zone of zones) {
    const existingZone = await prisma.zone.findFirst({
      where: { zoneName: zone.zoneName },
      select: { id: true },
    });

    if (existingZone) {
      await prisma.zone.update({
        where: { id: existingZone.id },
        data: zone,
      });
      continue;
    }

    await prisma.zone.create({ data: zone });
  }

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (username && password) {
    const hashed = await bcrypt.hash(password, 12);

    await prisma.admin.upsert({
      where: { username },
      update: { password: hashed },
      create: { username, password: hashed },
    });

    console.log(`Admin seeded: ${username}`);
  }

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
