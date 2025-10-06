import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateItem } from "./Item";
import { tablePrimaryKey } from "../constants";
import { db } from "./dbClient";

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = tablePrimaryKey;

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`;
const DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  // Early return for invalid requests
  if (!event.body) {
    return { statusCode: 400, body: 'Invalid request, you are missing the parameter body' };
  }

  const requestItem = typeof event.body == 'object' ? event.body : JSON.parse(event.body);

  // Always validate data from the client
  const item = validateItem(requestItem);

  // Generate a UUID V4 for the id
  const uuid = crypto.randomUUID();

  // Use expression attribute names and values to prevent injection-like issues
  // In a real application you would also sanitize the input values in a separate step
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { itemId: uuid },
    UpdateExpression: "SET #name = :name, #description = :description, #value = :value",
    ExpressionAttributeNames: {
      "#name": "name",
      "#description": "description",
      "#value": "value",
    },
    ExpressionAttributeValues: {
      ":name": item.name,
      ":description": item.description,
      ":value": item.value,
    },
  });

  try {
    await db.send(command);
    return { statusCode: 201, body: `${PRIMARY_KEY}: ${item[PRIMARY_KEY]}` };
  } catch (dbError: any) {
    const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
      RESERVED_RESPONSE : DYNAMODB_EXECUTION_ERROR;
    return { statusCode: 500, body: errorResponse };
  }
};
