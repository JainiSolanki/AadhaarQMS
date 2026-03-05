const { docClient } = require("../config/dynamodb");
const { generateId } = require("../utils/helpers");

class CenterService {
  // Get all centers
  async getAllCenters(filters = {}) {
    const { state, city, isActive = true } = filters;

    let params = {
      TableName: process.env.CENTERS_TABLE,
      FilterExpression: "isActive = :isActive",
      ExpressionAttributeValues: { ":isActive": isActive },
    };

    if (state) {
      params.FilterExpression += " AND #state = :state";
      params.ExpressionAttributeNames = { "#state": "state" };
      params.ExpressionAttributeValues[":state"] = state;
    }

    if (city) {
      if (!params.ExpressionAttributeNames) {
        params.ExpressionAttributeNames = {};
      }
      params.FilterExpression += " AND city = :city";
      params.ExpressionAttributeValues[":city"] = city;
    }

    const result = await docClient.scan(params).promise();
    return result.Items;
  }

  // Get center by ID
  async getCenterById(centerId) {
    const result = await docClient
      .get({
        TableName: process.env.CENTERS_TABLE,
        Key: { centerId },
      })
      .promise();

    return result.Item || null;
  }

  // Create center
  async createCenter(centerData) {
    const centerId = generateId("CENTER");
    const newCenter = {
      centerId,
      ...centerData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docClient
      .put({
        TableName: process.env.CENTERS_TABLE,
        Item: newCenter,
      })
      .promise();

    return newCenter;
  }

  // Update center
  async updateCenter(centerId, updates) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((key, index) => {
      updateExpression.push(`#field${index} = :value${index}`);
      expressionAttributeNames[`#field${index}`] = key;
      expressionAttributeValues[`:value${index}`] = updates[key];
    });

    updateExpression.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    await docClient
      .update({
        TableName: process.env.CENTERS_TABLE,
        Key: { centerId },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();

    return await this.getCenterById(centerId);
  }

  // Get unique cities grouped by state
  async getCitiesByState() {
    const result = await docClient
      .scan({
        TableName: process.env.CENTERS_TABLE,
        FilterExpression: "isActive = :isActive",
        ExpressionAttributeValues: { ":isActive": true },
        ProjectionExpression: "#state, city",
        ExpressionAttributeNames: { "#state": "state" },
      })
      .promise();

    const groupedByState = result.Items.reduce((acc, item) => {
      if (!acc[item.state]) {
        acc[item.state] = new Set();
      }
      acc[item.state].add(item.city);
      return acc;
    }, {});

    return Object.keys(groupedByState)
      .map((state) => ({
        state,
        cities: Array.from(groupedByState[state]).sort(),
      }))
      .sort((a, b) => a.state.localeCompare(b.state));
  }
}

module.exports = new CenterService();
