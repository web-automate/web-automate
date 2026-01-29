import * as bcrypt from "bcryptjs";
import { Role } from "../generated/prisma/enums";
import { prisma } from "../index";

async function main() {
  console.log('🌱 Starting seeding...');

  const email = 'admin@ha.com';
  const password = 'admin123';

  await prisma.account.deleteMany({ where: { accountId: email } });

  const owner = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Admin Web',
      email,
      emailVerified: true,
      role: Role.ADMIN,
    },
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.account.create({
    data: {
      userId: owner.id,
      accountId: email, 
      providerId: 'email',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Owner and Account credentials created');

  const templateMinimal = await prisma.template.upsert({
    where: { slug: 'minimalist-blog' },
    update: {},
    create: {
      name: 'Minimalist Blog',
      slug: 'minimalist-blog',
      thumbnail: 'https://placehold.co/600x400/png?text=Minimalist+Theme',
      source: 'git@github.com:web-automate/template-yehezkiel.git',
      defaultConfig: {
        colors: { primary: '#18181b', background: '#ffffff', text: '#27272a' },
        fonts: { heading: 'Inter', body: 'Merriweather' },
        features: { showReadingTime: true, enableDarkMode: false },
      },
    },
  });

  const website = await prisma.website.upsert({
    where: { domain: 'demo.web.id' },
    update: {},
    create: {
      name: 'Web Demo',
      domain: 'demo.web.id',
      templateId: templateMinimal.id,
      ownerId: owner.id,
      status: 'PUBLISHED',
    },
  });

  console.log('✅ Website created');

  await prisma.author.upsert({
    where: { slug: 'jax-ai' },
    update: {
      websites: { connect: { id: website.id } }
    },
    create: {
      name: 'Jax Intelligence',
      slug: 'jax-ai',
      image: 'https://api.dicebear.com/7.x/bottts/svg?seed=Jax',
      bio: 'AI-driven content creator specializing in digital trend analysis and modern lifestyle.',
      websiteUrl: 'https://web.id',
      websites: { connect: { id: website.id } }
    },
  });

  console.log('✅ Author created and linked to website');
  console.log('🏁 Seeding finished.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });