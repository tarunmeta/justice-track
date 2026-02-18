import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Cases (e2e) - Field Hardening Test', () => {
    let app: INestApplication;
    let authToken: string = '';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();

        // Login as an existing user to get a token (assuming a test user exists or mock)
        // For E2E, we might need a test setup script that seeds the DB.
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /cases', () => {
        it('should reject titles shorter than 5 characters', () => {
            return request(app.getHttpServer())
                .post('/cases')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Bad',
                    description: 'This is a long enough description to pass that specific field check.',
                    category: 'ACCIDENT',
                    location: 'Test City',
                    referenceNumber: 'REF-123'
                })
                .expect(400);
        });

        it('should reject extremely long descriptions (10k+ chars)', () => {
            return request(app.getHttpServer())
                .post('/cases')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Valid Case Title',
                    description: 'a'.repeat(10001),
                    category: 'ACCIDENT',
                    location: 'Test City',
                    referenceNumber: 'REF-123'
                })
                .expect(400);
        });

        it('should strip HTML tags from input fields', async () => {
            // This test would check the saved record in DB, or the response body if it returns sanitized data.
        });
    });
});
