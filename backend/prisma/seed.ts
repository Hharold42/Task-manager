import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

const USERS_COUNT = 200;
const TASKS_COUNT = 400;
const PASSWORD_SAMPLE = 'password123';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL env variable is not defined');
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const sampleTitles = [
  'Fix login bug',
  'Add onboarding flow',
  'Optimize database query',
  'Write API docs',
  'Implement caching layer',
  'Design landing page',
  'Refactor legacy module',
  'Prepare deployment pipeline',
  'Improve test coverage',
  'Research new feature',
];

const sampleDescriptions = [
  'High priority item coming from product.',
  'Coordinate with the frontend team.',
  'Needs review from security before release.',
  'Remember to add unit and e2e tests.',
  'Blocker for the next sprint.',
  'Sync with stakeholders for requirements.',
  'Document the changes thoroughly.',
  'Validate the flow with QA.',
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickDifferentIndex(max: number, excluded: number): number {
  let random = Math.floor(Math.random() * max);
  if (random === excluded) {
    random = (random + 1) % max;
  }
  return random;
}

async function main() {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash(PASSWORD_SAMPLE, 10);
  const usersData = Array.from({ length: USERS_COUNT }, (_, index) => ({
    email: `user${index + 1}@example.com`,
    password: hashedPassword,
  }));

  await prisma.user.createMany({ data: usersData });
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } });

  const tasksData = Array.from({ length: TASKS_COUNT }, (_, index) => {
    const authorIndex = Math.floor(Math.random() * users.length);
    const assigneeIndex = pickDifferentIndex(users.length, authorIndex);
    return {
      title: `${randomItem(sampleTitles)} #${index + 1}`,
      description:
        Math.random() > 0.3
          ? randomItem(sampleDescriptions)
          : null,
      authorId: users[authorIndex].id,
      asigneeId: users[assigneeIndex].id,
    };
  });

  await prisma.task.createMany({ data: tasksData });

  console.log(
    `Seed finished: ${USERS_COUNT} users and ${TASKS_COUNT} tasks created. Default password: ${PASSWORD_SAMPLE}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
