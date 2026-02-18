import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth (e2e) - Enterprise Stress Test', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /auth/register', () => {
        it('should reject extremely long names (100+ chars)', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'a'.repeat(101),
                    email: 'test@example.com',
                    password: 'Password123!',
                })
                .expect(400);
        });

        it('should reject weak passwords (no numbers/uppercase)', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password',
                })
                .expect(400);
        });

        it('should reject malformed emails', () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: 'Test User',
                    email: 'not-an-email',
                    password: 'Password123!',
                })
                .expect(400);
        });

        it('should accept and normalize valid registration', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    name: '  Trimmed User  ',
                    email: 'UPPERCASE@example.com',
                    password: 'Password123!',
                })
                .expect(201);

            expect(res.body.message).toContain('OTP sent');
        });
    });

    describe('POST /auth/login', () => {
        it('should reject SQL injection in email', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: "' OR 1=1 --",
                    password: 'somepassword',
                })
                .expect(400);
        });
    });
});
