import { faker } from "@faker-js/faker";
import { Hotel } from "@prisma/client";
import { prisma } from "@/config";
export function createHotel(name?: string, image?: string): Promise<Hotel> {
    return prisma.hotel.create({
        data: {
            name: name || faker.name.findName(),
            image: image || faker.internet.url()
        },
    });
}
export function createRoom(hotelId: number) { //"name", "capacity", "hotelId"
    return prisma.room.create({
        data: {
            name: faker.name.firstName(),
            capacity: faker.datatype.number(),
            hotelId
        }
    })
}