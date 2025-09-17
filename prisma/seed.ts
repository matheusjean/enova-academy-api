import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const password = await argon2.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@enova.local' },
    update: {},
    create: {
      email: 'admin@enova.local',
      name: 'Enova Admin',
      password,
      role: Role.admin,
    },
  });
  console.log('Seeded admin:', admin.email);
}

main().finally(() => prisma.$disconnect());
