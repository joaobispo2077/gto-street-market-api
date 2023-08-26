const { putItem } = require("../helpers/dynamo");
const { buildResponse, errorResponse } = require("../helpers/response");
const TableName = process.env.DYNAMODB_TABLE;

const handler = async (event) => {
    try {
        let cognitoUserId;
        if (event.requestContext.authorizer)
            cognitoUserId = event.requestContext.authorizer.claims.sub;

        const id = event.pathParameters?.id;

        if (!id) {
            throw { statusCode: 400, message: "invalid param" };
        }

        const now = new Date().toISOString();

        const keySchema = {"PK":"id"};

        const item = JSON.parse(event.body);

        let Item = {
            [keySchema.PK]: id,
            ...item,
            updatedAt: now
        };

        if (cognitoUserId) Item.cognitoUserId = cognitoUserId;

        await putItem(TableName, Item);
        return buildResponse(200, { message: "success" });
    } catch (error) {
        return errorResponse(error);
    }
};

module.exports = { handler };
