import { prisma } from "@/config";
import { Ticket, TicketType, Hotel } from "@prisma/client";

function findAll() {
    return prisma.hotel.findMany()
}

function findEnrollmentByUserId(userId: number) {
    return prisma.enrollment.findUnique({
        where: { userId }
    })
}

function findTicketByEnrollmentId(enrollmentId: number) {
    return prisma.ticket.findUnique({
        where: { enrollmentId },
        include: { TicketType: true }
    })
}

function findHotelsById(hotelId: number) {
    return prisma.hotel.findFirst({
        where: { id: hotelId },
        include: { Rooms: true }
    });
};
export const hotelRepository = { findAll, findEnrollmentByUserId, findTicketByEnrollmentId, findHotelsById }