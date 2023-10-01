import supertest from 'supertest';
import app, { init } from '@/app';
import { cleanDb, generateValidToken } from '../helpers';
import httpStatus from 'http-status';
import { faker } from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { createEnrollmentWithAddress, createHotel, createRoom, createTicket, createTicketType, createUser } from '../factories';
import { TicketStatus } from '@prisma/client';

beforeAll(async () => {
    await init()
})
beforeEach(async () => {
    await cleanDb()
})

const server = supertest(app)

describe("GET /hotels", () => {
    it('should return 401 when token is not given', async () => {
        const response = await server.get("/hotels")
        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })
    it('should return 401 when token is not authorized', async () => {
        const token = faker.lorem.word()
        const response = await server.get("/hotels").set('Authorization', `Bearer ${token}`)
        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })
    it('should return 401 when there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    describe("when token is valid", () => {
        it('should return 404 when user is not enrolled', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createHotel();
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND)
        })
        it('should return 404 when user enrollment does not have a ticket', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createHotel();
            await createEnrollmentWithAddress(user);
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND)
        })
        it('Should return 402 when ticket was not paid', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createHotel();
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
        });
        it('Should return 402 when ticket is remote', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createHotel();
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(true, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
        });
        it('Should return 402 when ticket does not include hotel', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createHotel();
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, false);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
        });
        it('Should return 404 when there is no hotel registered', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(status).toBe(httpStatus.NOT_FOUND);
        });
        it('Should return 200 and corect response when everything is ok', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createHotel();
            await createHotel();
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const { status, body } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(status).toBe(httpStatus.OK);
            expect(body).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    image: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                })
            ]))
            expect(body).toHaveLength(2)
        })
    })
})

describe("GET /hotels", () => {
    it('should return 401 when token is not given', async () => {
        const hotel = await createHotel();
        const response = await server.get(`/hotels/${hotel.id}`)
        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })
    it('should return 401 when token is not authorized', async () => {
        const token = faker.lorem.word()
        const hotel = await createHotel();
        const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })
    it('should return 401 when there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
        const hotel = await createHotel();
        const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    describe('when token is valid', () => {
        it('should return 404 when user do not have a enrollment', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(httpStatus.NOT_FOUND)
        })
        it('should return 404 when user enrollment does not have a ticket', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            await createEnrollmentWithAddress(user);
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND)
        })
        it('should return 402 when user ticket is not paid yet', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)
        })
        it('should return 402 when user ticket is remote', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(true, true)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)
        })
        it('should return 402 when user ticket do not include hotel', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, false)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)
        })
        it('should return 404 when user hotel do not exist (invalid hotelId)', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const response = await server.get(`/hotels/${hotel.id + 1}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND)
        })
        it('Should return 200 and corect response when everything is ok', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const rooma = await createRoom(hotel.id)
            const roomb = await createRoom(hotel.id)
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true)
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const { status, body } = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(status).toBe(httpStatus.OK)
            expect(body).toEqual(expect.objectContaining({
                id: hotel.id,
                name: hotel.name,
                image: hotel.image,
                createdAt: hotel.createdAt.toISOString(),
                updatedAt: hotel.updatedAt.toISOString(),
                Rooms: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        capacity: expect.any(Number),
                        hotelId: expect.any(Number),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    })
                ])

            }))
            expect(body.Rooms).toHaveLength(2)
        })
    })

})