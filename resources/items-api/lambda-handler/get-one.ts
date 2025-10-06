import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { tablePrimaryKey } from "../constants";
import { db } from "./dbClient";

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = tablePrimaryKey;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const requestedItemId = event.pathParameters?.id;
  if (!requestedItemId) {
    return { statusCode: 400, body: `Error: You are missing the path parameter id` };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: requestedItemId
    }
  };

  try {
    const response = await db.get(params);
    if (response.Item) {
      return { statusCode: 200, body: JSON.stringify(response.Item) };
    } else {
      return { statusCode: 404, body: "" };
    }
  } catch (dbError) {
    // We do not want to leak internal errors to the clients. Use a general text and status code instead
    console.error("Something went wrong wrong with DynamoDB query", dbError);
    return { statusCode: 500, body: "Something went wrong. Try again later." };
  }
};
