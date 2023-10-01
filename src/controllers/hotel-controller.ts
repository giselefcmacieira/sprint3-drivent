import { AuthenticatedRequest } from "@/middlewares";
import { hotelService } from "@/services";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const hotels = await hotelService.getHotels(userId)
    return res.status(httpStatus.OK).send(hotels)
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const hotelId = Number(req.params.hotelId)
    const hotel = await hotelService.getHotelById(userId, hotelId)
    return res.status(httpStatus.OK).send(hotel)
}