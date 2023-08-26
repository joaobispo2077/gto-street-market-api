const { deleteItem } = require("../helpers/dynamo");
const { buildResponse, errorResponse } = require("../helpers/response");
const TableName = process.env.DYNAMODB_TABLE;

const handler = async (event) => {
    try {
        const id = event.pathParameters?.id;

        if (!id) {
            throw { statusCode: 400, message: "invalid param" };
        }

        const keySchema = {"PK":"id"};

        let Item = {
            [keySchema.PK]: id
        };

        await deleteItem(TableName, Item);
        return buildResponse(200, { message: "success" });
    } catch (error) {
        return errorResponse(error);
    }
};

module.exports = { handler };
