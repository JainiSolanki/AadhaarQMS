const { docClient } = require("../config/dynamodb");
const {
  generateId,
  generateTokenNumber,
  encryptAadhaar,
  getSlotAvailability,
} = require("../utils/helpers");
const { STATUSES } = require("../utils/constants");

class AppointmentService {
  // Check if user can book (not blocked, no duplicate)
  async canUserBook(userId, date) {
    // Check if blocked
    const userResult = await docClient
      .get({
        TableName: process.env.USERS_TABLE,
        Key: { userId },
      })
      .promise();

    const user = userResult.Item;
    if (!user) {
      throw new Error("User not found");
    }

    if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
      return {
        canBook: false,
        reason: "User is blocked due to multiple no-shows",
        blockedUntil: user.blockedUntil,
      };
    }

    // Check for duplicate booking on same date
    const existingResult = await docClient
      .query({
        TableName: process.env.APPOINTMENTS_TABLE,
        IndexName: "user-index",
        KeyConditionExpression: "userId = :userId",
        FilterExpression:
          "#date = :date AND #status IN (:pending, :checkedIn, :inProgress)",
        ExpressionAttributeNames: {
          "#date": "date",
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":date": date,
          ":pending": STATUSES.PENDING,
          ":checkedIn": STATUSES.CHECKED_IN,
          ":inProgress": STATUSES.IN_PROGRESS,
        },
      })
      .promise();

    if (existingResult.Items.length > 0) {
      return {
        canBook: false,
        reason: "You already have an appointment on this date",
      };
    }

    return { canBook: true };
  }

  // Create appointment
  async createAppointment(data) {
    const { userId, centerId, serviceId, date, timeSlot, name, aadhaarNumber } =
      data;

    // Check slot availability
    const availability = await getSlotAvailability(centerId, date, timeSlot);
    if (availability.isFull) {
      throw new Error("This slot is fully booked");
    }

    // Generate token
    const tokenNumber = await generateTokenNumber(centerId, date);

    // Create appointment
    const appointmentId = generateId("APPT");
    const appointment = {
      appointmentId,
      userId,
      centerId,
      serviceId,
      name,
      aadhaarNumber: aadhaarNumber ? encryptAadhaar(aadhaarNumber) : null,
      date,
      timeSlot,
      tokenNumber,
      status: STATUSES.PENDING,
      queuePosition: availability.booked + 1,
      operatorId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docClient
      .put({
        TableName: process.env.APPOINTMENTS_TABLE,
        Item: appointment,
      })
      .promise();

    return appointment;
  }

  // Get appointments by user
  async getUserAppointments(userId) {
    const result = await docClient
      .query({
        TableName: process.env.APPOINTMENTS_TABLE,
        IndexName: "user-index",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
        ScanIndexForward: false,
      })
      .promise();

    return result.Items;
  }

  // Get appointments by center and date
  async getCenterAppointments(centerId, date) {
    const result = await docClient
      .query({
        TableName: process.env.APPOINTMENTS_TABLE,
        IndexName: "center-date-index",
        KeyConditionExpression: "centerId = :centerId AND #date = :date",
        ExpressionAttributeNames: { "#date": "date" },
        ExpressionAttributeValues: {
          ":centerId": centerId,
          ":date": date,
        },
      })
      .promise();

    return result.Items;
  }

  // Update appointment status
  async updateStatus(appointmentId, newStatus, operatorId = null) {
    const updateExpression = [
      "SET #status = :status",
      "updatedAt = :updatedAt",
    ];
    const expressionAttributeNames = { "#status": "status" };
    const expressionAttributeValues = {
      ":status": newStatus,
      ":updatedAt": new Date().toISOString(),
    };

    if (operatorId) {
      updateExpression.push("operatorId = :operatorId");
      expressionAttributeValues[":operatorId"] = operatorId;
    }

    await docClient
      .update({
        TableName: process.env.APPOINTMENTS_TABLE,
        Key: { appointmentId },
        UpdateExpression: updateExpression.join(", "),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();
  }

  // Cancel appointment
  async cancelAppointment(appointmentId, userId) {
    // Get appointment
    const result = await docClient
      .get({
        TableName: process.env.APPOINTMENTS_TABLE,
        Key: { appointmentId },
      })
      .promise();

    if (!result.Item) {
      throw new Error("Appointment not found");
    }

    const appointment = result.Item;

    // Verify ownership
    if (appointment.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Check if cancellable
    if (
      [STATUSES.COMPLETED, STATUSES.CANCELLED, STATUSES.NO_SHOW].includes(
        appointment.status,
      )
    ) {
      throw new Error("Cannot cancel appointment in current status");
    }

    // Check time window (2 hours before)
    const appointmentDateTime = new Date(
      `${appointment.date}T${appointment.timeSlot.split(" - ")[0]}`,
    );
    const now = new Date();
    const hoursDiff = (appointmentDateTime - now) / (1000 * 60 * 60);

    if (hoursDiff < 2) {
      throw new Error("Cannot cancel within 2 hours of appointment");
    }

    // Update to cancelled
    await this.updateStatus(appointmentId, STATUSES.CANCELLED);
  }
}

module.exports = new AppointmentService();
