import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
const prisma = new PrismaClient();
async function main() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await prisma.$connect();
        console.log('Successfully connected to MongoDB!');
        // Simple query to test
        const userCount = await prisma.user.count();
        console.log(`Current user count: ${userCount}`);
    }
    catch (error) {
        console.error('Failed to connect to MongoDB:');
        console.error(error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
