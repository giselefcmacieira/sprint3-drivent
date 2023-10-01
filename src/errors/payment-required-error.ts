import { ApplicationError } from '@/protocols';

export function paymentRequiredError(message: string = 'payment required'): ApplicationError {
    return {
        name: 'PaymentRequired',
        message
    };
};