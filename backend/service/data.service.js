const { Op } = require("sequelize");
const Data = require("../model/data");
const { connection_server } = require("../config/db");
const express = require("express");
const app = express();

let clients = [];
let timeoutMap = new Map();

// Function to convert date and time
function convertDateTime(c_date, c_time) {
  const year = Math.floor(c_date / 10000);
  const month = Math.floor((c_date % 10000) / 100) - 1;
  const day = c_date % 100;

  const hours = Math.floor(c_time / 10000);
  const minutes = Math.floor((c_time % 10000) / 100);
  const seconds = c_time % 100;

  return new Date(year, month, day, hours, minutes, seconds);
}

// Function to send events to SSE clients
function sendEventToClients(data) {
  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(data)}\n\n`)
  );
}

// Function to update office status
async function updateOfficeStatus(latestUid, checkInTime) {
  try {
    if (timeoutMap.has(latestUid)) {
      clearTimeout(timeoutMap.get(latestUid));
    }

    const updateResult = await Data.update(
      {
        status: "in_office",
        last_checkin: new Date(), // ใช้เวลาปัจจุบัน
      },
      {
        where: { data_id: latestUid },
      }
    );

    if (updateResult[0] > 0) {
      console.log(`Updated in_office status for data_id: ${latestUid}`);
      sendEventToClients({
        data_id: latestUid,
        status: "in_office",
        last_checkin: checkInTime,
      });

      // ใช้เวลาหมดเวลาที่ตั้งค่าหรือค่าเริ่มต้น 30 นาที
      const timeoutDuration = process.env.OFFICE_TIMEOUT 
      ? parseInt(process.env.OFFICE_TIMEOUT) 
      : 30 * 60 * 1000;
      
      const timeout = setTimeout(async () => {
        try {
          await Data.update(
            { status: "out_office" },
            { where: { data_id: latestUid } }
          );
          console.log(`Updated status to out_office for data_id: ${latestUid}`);
          sendEventToClients({ data_id: latestUid, status: "out_office" });
          timeoutMap.delete(latestUid);
        } catch (error) {
          console.error("Error updating status to out_office:", error);
        }
      }, timeoutDuration);
      // 30 * 60 * 1000); // 30 นาที

      timeoutMap.set(latestUid, timeout);
    } else {
      console.log(`No matching record found for data_id: ${latestUid}`);
    }
  } catch (error) {
    console.error("Error updating office status:", error);
  }
}

// Function to process notifications
async function processNotifications() {
  try {
    const notifications = await connection_server.query(
      "SELECT * FROM notifications ORDER BY created_at ASC",
      { type: connection_server.QueryTypes.SELECT }
    );

    for (const notification of notifications) {
      const { data_id, c_date, c_time } = notification;
      const checkInTime = convertDateTime(c_date, c_time);
      await updateOfficeStatus(data_id, checkInTime);
    }

    await connection_server.query("DELETE FROM notifications", {
      type: connection_server.QueryTypes.DELETE,
    });
  } catch (error) {
    console.error("Error processing notifications:", error);
  }
}

// SSE Route
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write("data: Connected to SSE server\n\n");

  const clientId = Date.now();
  clients.push({ id: clientId, res });

  req.on("close", () => {
    clients = clients.filter((client) => client.id !== clientId);
  });
});

setInterval(processNotifications, 1000);

// Add a cleanup function to clear all timeouts when server shuts down
function cleanup() {
  for (const [data_id, timeout] of timeoutMap.entries()) {
    clearTimeout(timeout);
    console.log(`Cleared timeout for data_id: ${data_id}`);
  }
  timeoutMap.clear();
}

module.exports = { updateOfficeStatus, cleanup };
