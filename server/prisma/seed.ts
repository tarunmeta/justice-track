import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123456', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@justicetrack.com' },
        update: {},
        create: {
            name: 'System Admin',
            email: 'admin@justicetrack.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
            status: 'VERIFIED',
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create moderator
    const modPassword = await bcrypt.hash('Moderator@123', 12);
    const moderator = await prisma.user.upsert({
        where: { email: 'mod@justicetrack.com' },
        update: {},
        create: {
            name: 'Lead Moderator',
            email: 'mod@justicetrack.com',
            passwordHash: modPassword,
            role: 'MODERATOR',
            status: 'VERIFIED',
        },
    });
    console.log('✅ Moderator created:', moderator.email);

    // Create lawyer
    const lawyerPassword = await bcrypt.hash('Lawyer@123456', 12);
    const lawyer = await prisma.user.upsert({
        where: { email: 'lawyer@justicetrack.com' },
        update: {},
        create: {
            name: 'Adv. Priya Sharma',
            email: 'lawyer@justicetrack.com',
            passwordHash: lawyerPassword,
            role: 'LAWYER',
            status: 'VERIFIED',
        },
    });
    console.log('✅ Lawyer created:', lawyer.email);

    // Create public user
    const userPassword = await bcrypt.hash('User@1234567', 12);
    const publicUser = await prisma.user.upsert({
        where: { email: 'user@justicetrack.com' },
        update: {},
        create: {
            name: 'Rahul Kumar',
            email: 'user@justicetrack.com',
            passwordHash: userPassword,
            role: 'PUBLIC',
            status: 'VERIFIED',
        },
    });
    console.log('✅ Public user created:', publicUser.email);

    // Create sample cases
    const cases = [
        {
            title: 'Road Accident at National Highway 48 - Hit and Run',
            description: 'A severe hit-and-run incident occurred on NH-48 near Gurugram toll plaza. The victim sustained critical injuries. FIR has been lodged and CCTV footage is being reviewed by authorities.',
            category: 'ACCIDENT' as const,
            location: 'Gurugram, Haryana',
            referenceNumber: 'FIR/2024/GGN/00891',
            sourceUrl: 'https://example.com/news/hit-and-run-nh48',
            status: 'VERIFIED' as const,
            createdById: publicUser.id,
            verifiedById: moderator.id,
            supportCount: 234,
            opposeCount: 12,
            groundStatus: 'Police investigation is underway. Key suspect identified through CCTV.',
        },
        {
            title: 'Municipal Corporation Corruption - Unauthorized Construction Permits',
            description: 'Multiple unauthorized construction permits were allegedly issued by municipal officials in exchange for bribes. Over 15 illegal constructions identified in residential zones.',
            category: 'CORRUPTION' as const,
            location: 'Delhi, NCR',
            referenceNumber: 'ACB/2024/DL/00342',
            status: 'UNDER_INVESTIGATION' as const,
            createdById: publicUser.id,
            supportCount: 567,
            opposeCount: 23,
            groundStatus: 'Anti-corruption bureau has initiated proceedings. Hearing scheduled.',
        },
        {
            title: 'Public Park Assault Incident - Sector 22',
            description: 'A physical assault was reported in Sector 22 public park during evening hours. Multiple witnesses present. Victim filed FIR and medical reports have been submitted.',
            category: 'ASSAULT' as const,
            location: 'Chandigarh',
            referenceNumber: 'FIR/2024/CHD/01234',
            status: 'COURT_HEARING' as const,
            createdById: publicUser.id,
            verifiedById: moderator.id,
            supportCount: 189,
            opposeCount: 5,
            groundStatus: 'Accused is in judicial custody. Court hearing on 15th March 2024.',
        },
        {
            title: 'Water Contamination in Industrial Area',
            description: 'Industrial waste being dumped into the local water supply affecting 3 villages. Residents have reported health issues. NGT complaint filed.',
            category: 'PUBLIC_SAFETY' as const,
            location: 'Ludhiana, Punjab',
            referenceNumber: 'NGT/2024/PB/00156',
            status: 'VERIFIED' as const,
            createdById: publicUser.id,
            verifiedById: moderator.id,
            supportCount: 892,
            opposeCount: 45,
            groundStatus: 'NGT has issued notice to the factory. Water samples collected for testing.',
        },
        {
            title: 'Traffic Signal Malfunction Causing Accidents',
            description: 'Malfunctioning traffic signals at the MG Road junction have caused 3 accidents in the past week. Multiple complaints to traffic police have gone unaddressed.',
            category: 'PUBLIC_SAFETY' as const,
            location: 'Bangalore, Karnataka',
            referenceNumber: 'BBMP/2024/TRF/00789',
            status: 'PENDING_REVIEW' as const,
            createdById: publicUser.id,
            supportCount: 45,
            opposeCount: 2,
        },
    ];

    for (const caseData of cases) {
        const created = await prisma.case.create({ data: caseData });

        // Add timeline entries
        await prisma.caseUpdate.create({
            data: {
                caseId: created.id,
                updateText: 'Case submitted and awaiting review',
                updateType: 'SUBMISSION',
                createdById: publicUser.id,
            },
        });

        if (caseData.status !== 'PENDING_REVIEW') {
            await prisma.caseUpdate.create({
                data: {
                    caseId: created.id,
                    updateText: 'Case reviewed and processed by moderation team',
                    updateType: 'REVIEW',
                    createdById: moderator.id,
                },
            });
        }

        if (caseData.status === 'VERIFIED' || caseData.status === 'COURT_HEARING') {
            await prisma.caseUpdate.create({
                data: {
                    caseId: created.id,
                    updateText: 'Case verified with official records',
                    updateType: 'VERIFICATION',
                    createdById: moderator.id,
                },
            });
        }

        console.log(`✅ Case created: ${created.title.substring(0, 50)}...`);
    }

    // Add lawyer comments
    const verifiedCases = await prisma.case.findMany({ where: { status: 'VERIFIED' }, take: 2 });
    for (const c of verifiedCases) {
        await prisma.lawyerComment.create({
            data: {
                caseId: c.id,
                lawyerId: lawyer.id,
                explanation: `Under the relevant sections of the Indian Penal Code and applicable statutes, this case involves procedural aspects that require careful examination. The complainant has provided sufficient initial evidence for investigation. Key legal provisions apply, and the matter is being handled according to due process under the law.`,
            },
        });
    }
    console.log('✅ Lawyer comments added');

    console.log('\n🎉 Seeding completed!\n');
    console.log('📧 Login credentials:');
    console.log('   Admin:     admin@justicetrack.com / Admin@123456');
    console.log('   Moderator: mod@justicetrack.com / Moderator@123');
    console.log('   Lawyer:    lawyer@justicetrack.com / Lawyer@123456');
    console.log('   User:      user@justicetrack.com / User@1234567');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
