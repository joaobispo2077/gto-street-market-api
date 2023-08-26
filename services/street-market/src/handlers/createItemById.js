const { putItem } = require("../helpers/dynamo");
const { randomUUID } = require("crypto");
const { buildResponse, errorResponse } = require("../helpers/response");
const TableName = process.env.DYNAMODB_TABLE;
const handler = async (event) => {
    try {
        let cognitoUserId;
        if (event.requestContext.authorizer)
            cognitoUserId = event.requestContext.authorizer.claims.sub;
        const item = JSON.parse(event.body);
        const id = randomUUID();
        const now = new Date().toISOString();

        const keySchema = {"PK":"id"};

        let Item = {
            [keySchema.PK]: id,
            ...item,
            createdAt: now,
            updatedAt: now
        };

        if (cognitoUserId) Item.cognitoUserId = cognitoUserId;

        await putItem(TableName, Item);
        return buildResponse(201, Item);
    } catch (error) {
        return errorResponse(error);
    }
};

module.exports = { handler };
