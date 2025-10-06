jest.mock("../dbClient", () => ({
    db: {
        get: jest.fn(),
    },
}));

import { handler } from '../get-one';
import { db } from '../dbClient';

const mockGet = db.get as jest.Mock;

describe('get-one Lambda handler', () => {
    beforeEach(() => {
        process.env.TABLE_NAME = 'TestTable';
        mockGet.mockReset();
    });

    it('should return 200 and the item when found', async () => {
        mockGet.mockResolvedValue({
            Item: {
                itemId: 'b3f1c8a2-9e4b-4a1e-8f2e-123456789abc',
                name: 'Football',
                description: 'A round ball used in the sport',
                value: 25,
            },
        });

        const event = {
            pathParameters: {
                id: 'b3f1c8a2-9e4b-4a1e-8f2e-123456789abc',
            },
        } as any;

        const result = await handler(event);

        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body);
        expect(body.name).toBe('Football');
        expect(body.description).toBe('A round ball used in the sport');
        expect(body.value).toBe(25);
    });

    it('should return 400 if id is missing', async () => {
        const event = {
            pathParameters: {},
        } as any;

        const result = await handler(event);

        expect(result.statusCode).toBe(400);
        expect(result.body).toContain('missing the path parameter id');
    });

    it('should return 404 if item is not found', async () => {
        mockGet.mockResolvedValue({});

        const event = {
            pathParameters: {
                id: 'non-existent-id',
            },
        } as any;

        const result = await handler(event);

        expect(result.statusCode).toBe(404);
        expect(result.body).toBe('');
    });

    it('should return 500 on DynamoDB error', async () => {
        mockGet.mockRejectedValue(new Error('DynamoDB failure'));

        const event = {
            pathParameters: {
                id: 'error-id',
            },
        } as any;

        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        expect(result.body).toBe('Something went wrong. Try again later.');
    });
});