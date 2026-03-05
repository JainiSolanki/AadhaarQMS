const { docClient } = require("../config/dynamodb");
const { STATUSES } = require("../utils/constants");
const { formatDate } = require("../utils/helpers");

class QueueService {
  // Get current queue for a center
  async getCenterQueue(centerId, date = null) {
    const targetDate = date || formatDate(new Date());

    const result = await docClient
      .query({
        TableName: process.env.APPOINTMENTS_TABLE,
        IndexName: "center-date-index",
        KeyConditionExpression: "centerId = :centerId AND #date = :date",
        FilterExpression: "#status IN (:pending, :checkedIn, :inProgress)",
        ExpressionAttributeNames: {
          "#date": "date",
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":centerId": centerId,
          ":date": targetDate,
          ":pending": STATUSES.PENDING,
          ":checkedIn": STATUSES.CHECKED_IN,
          ":inProgress": STATUSES.IN_PROGRESS,
        },
      })
      .promise();

    // Sort by token number
    const queue = result.Items.sort((a, b) =>
      a.tokenNumber.localeCompare(b.tokenNumber),
    );

    return {
      date: targetDate,
      centerId,
      totalInQueue: queue.length,
      currentServing:
        queue.find((appt) => appt.status === STATUSES.IN_PROGRESS) || null,
      queue,
    };
  }

  // Get appointment position in queue
  async getAppointmentPosition(appointmentId) {
    // Get appointment
    const apptResult = await docClient
      .get({
        TableName: process.env.APPOINTMENTS_TABLE,
        Key: { appointmentId },
      })
      .promise();

    if (!apptResult.Item) {
      throw new Error("Appointment not found");
    }

    const appointment = apptResult.Item;

    // Get queue
    const queueData = await this.getCenterQueue(
      appointment.centerId,
      appointment.date,
    );

    const position =
      queueData.queue.findIndex(
        (appt) => appt.appointmentId === appointmentId,
      ) + 1;
    const estimatedWaitMinutes = (position - 1) * 15; // 15 min per appointment

    return {
      tokenNumber: appointment.tokenNumber,
      status: appointment.status,
      position,
      totalInQueue: queueData.totalInQueue,
      currentServing: queueData.currentServing
        ? queueData.currentServing.tokenNumber
        : null,
      estimatedWaitMinutes,
      timeSlot: appointment.timeSlot,
    };
  }

  // Get next in queue (for operator to call)
  async getNextInQueue(centerId, date = null) {
    const queueData = await this.getCenterQueue(centerId, date);

    // Find first pending
    const nextAppointment = queueData.queue.find(
      (appt) => appt.status === STATUSES.PENDING,
    );

    return nextAppointment || null;
  }
}

module.exports = new QueueService();
