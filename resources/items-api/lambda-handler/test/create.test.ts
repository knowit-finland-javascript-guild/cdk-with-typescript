// Mock before importing for Jest Mocks to work properly
jest.mock('../dbClient', () => ({
    db: {
        send: jest.fn(),
    },
}));

jest.mock('../Item', () => ({
    validateItem: jest.fn(),
}));

import { handler } from '../create';
import { db } from '../dbClient';
import { validateItem } from '../Item';

const mockSend = db.send as jest.Mock;
const mockValidateItem = validateItem as jest.Mock;

describe('create-one Lambda handler', () => {
    beforeEach(() => {
        process.env.TABLE_NAME = 'TestTable';
        mockSend.mockReset();
        mockValidateItem.mockReset();
    });

    it('should return 201 when item is successfully created', async () => {
        const footballItem = {
            name: 'Football',
            description: 'A round ball used in the sport',
            value: 25,
        };

        mockValidateItem.mockReturnValue(footballItem);
        mockSend.mockResolvedValue({});

        const event = {
            body: JSON.stringify(footballItem),
        } as any;

        const result = await handler(event);

        expect(result.statusCode).toBe(201);
        expect(result.body).toContain('itemId'); // assuming PRIMARY_KEY is 'itemId'
        expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if body is missing', async () => {
        const event = {
            body: null,
        } as any;

        const result = await handler(event);

        expect(result.statusCode).toBe(400);
        expect(result.body).toContain('missing the parameter body');
    });

    it('should return 500 on DynamoDB error', async () => {
        const footballItem = {
            name: 'Football',
            description: 'A round ball used in the sport',
            value: 25,
        };

        mockValidateItem.mockReturnValue(footballItem);
        mockSend.mockRejectedValue(new Error('DynamoDB failure'));

        const event = {
            body: JSON.stringify(footballItem),
        } as any;

        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        expect(result.body).toContain('Dynamodb error');
    });

    it('should return reserved keyword error if ValidationException is thrown', async () => {
        const footballItem = {
            name: 'Football',
            description: 'A round ball used in the sport',
            value: 25,
        };

        mockValidateItem.mockReturnValue(footballItem);
        mockSend.mockRejectedValue({
            code: 'ValidationException',
            message: 'reserved keyword',
        });

        const event = {
            body: JSON.stringify(footballItem),
        } as any;

        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        expect(result.body).toContain('reserved keywords');
    });
});