import { conflictError, duplicatedEmailError, enrollmentNotFoundError, notFoundError, paymentRequiredError } from "@/errors";

import { hotelRepository } from "@/repositories";
import { Enrollment } from "@prisma/client";

async function getHotelss() {
    return await hotelRepository.findAll()
}

async function getHotels(userId: number) {
    const enrollment = await hotelRepository.findEnrollmentByUserId(userId)
    if (!enrollment) {
        throw notFoundError('This user does not have a enrollment')
    }
    const ticket = await hotelRepository.findTicketByEnrollmentId(enrollment.id)
    if (!ticket) {
        throw notFoundError('This user enrollment has no ticket')
    }
    if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw paymentRequiredError('The ticket has not been paid yet')
    }
    const hotels = await hotelRepository.findAll()
    if (hotels.length === 0) {
        throw notFoundError('That are no hotels registered')
    }
    return hotels
}

async function getHotelById(userId: number, hotelId: number) {
    const enrollment = await hotelRepository.findEnrollmentByUserId(userId)
    if (!enrollment) {
        throw notFoundError('This user does not have a enrollment')
    }
    const ticket = await hotelRepository.findTicketByEnrollmentId(enrollment.id)
    if (!ticket) {
        throw notFoundError('This user enrollment has no ticket')
    }
    if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw paymentRequiredError('The ticket has not been paid yet')
    }
    return await hotelRepository.findHotelsById(hotelId)
}

export const hotelService = { getHotels, getHotelById, getHotelss }