const { Op } = require("sequelize");
const Data = require("../model/data");
const { connection_server } = require("../config/db");
const express = require("express");

const app = express();
const port = 3000;

let clients = [];
let lastProcessedDate = null;
let lastProcessedTime = null;
const timeoutMap = new Map(); // Map เพื่อเก็บ timeout reference

// ฟังก์ชันในการแปลง c_date และ c_time ให้เป็นวันที่และเวลาใน JavaScript
function convertDateTime(c_date, c_time) {
  const year = Math.floor(c_date / 10000);
  const month = Math.floor((c_date % 10000) / 100) - 1;
  const day = c_date % 100;

  const hours = Math.floor(c_time / 10000);
  const minutes = Math.floor((c_time % 10000) / 100);
  const seconds = c_time % 100;

  return new Date(year, month, day, hours, minutes, seconds);
}

// ฟังก์ชันในการส่งข้อมูลไปยัง client ผ่าน SSE
function sendEventToClients(data) {
  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(data)}\n\n`)
  );
}

// ฟังก์ชันในการอัพเดทสถานะใน_office
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

      // ตั้ง timeout 30 นาทีเพื่อเปลี่ยนสถานะเป็น out_office
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
      }, 30 * 1000); // 30 วินาที
      // 30 * 60 * 1000);

      timeoutMap.set(latestUid, timeout);

      // อัปเดตค่า lastProcessedDate และ lastProcessedTime
      lastProcessedDate =
        checkInTime.getFullYear() * 10000 +
        (checkInTime.getMonth() + 1) * 100 +
        checkInTime.getDate();
      lastProcessedTime =
        checkInTime.getHours() * 10000 +
        checkInTime.getMinutes() * 100 +
        checkInTime.getSeconds();
    } else {
      console.log(`No matching record found for data_id: ${latestUid}`);
    }
  } catch (error) {
    console.error("Error updating office status:", error);
  }
}

async function checkNewData() {
  try {
    // กำหนดเงื่อนไขในการดึงข้อมูลใหม่
    const whereCondition = {
      c_date: { [Op.gte]: lastProcessedDate }, // ตรวจสอบเฉพาะข้อมูลที่มี c_date >= lastProcessedDate
    };

    // เพิ่มเงื่อนไขในการตรวจสอบ c_time ถ้ามี lastProcessedDate แล้ว
    if (lastProcessedDate !== null) {
      whereCondition.c_time = { [Op.gt]: lastProcessedTime }; // ดึงข้อมูลที่มี c_time > lastProcessedTime
    }

    // ดึงข้อมูลใหม่จากฐานข้อมูล
    const latestRecords = await connection_server.query(
      "SELECT l_uid, c_date, c_time FROM test WHERE c_date >= :lastProcessedDate AND c_time > :lastProcessedTime ORDER BY c_date DESC, c_time DESC",
      {
        type: connection_server.QueryTypes.SELECT,
        replacements: {
          lastProcessedDate,
          lastProcessedTime,
        },
      }
    );

    // ตรวจสอบว่ามีข้อมูลใหม่หรือไม่
    if (latestRecords.length > 0) {
      let latestProcessedDate = lastProcessedDate;
      let latestProcessedTime = lastProcessedTime;

      // ประมวลผลข้อมูลที่ดึงมา
      for (const record of latestRecords) {
        const { l_uid, c_date, c_time } = record;
        const checkInTime = convertDateTime(c_date, c_time);

        // ตรวจสอบว่าเป็นข้อมูลใหม่ที่ยังไม่เคยประมวลผล
        if (
          c_date > latestProcessedDate ||
          (c_date === latestProcessedDate && c_time > latestProcessedTime)
        ) {
          // อัปเดตสถานะใน_office
          await updateOfficeStatus(l_uid, checkInTime);
        }

        // อัปเดตค่าของ `latestProcessedDate` และ `latestProcessedTime` เพื่อใช้ในการตรวจสอบข้อมูลถัดไป
        if (
          c_date > latestProcessedDate ||
          (c_date === latestProcessedDate && c_time > latestProcessedTime)
        ) {
          latestProcessedDate = c_date;
          latestProcessedTime = c_time;
        }
      }

      // อัปเดตค่า lastProcessedDate และ lastProcessedTime
      lastProcessedDate = latestProcessedDate;
      lastProcessedTime = latestProcessedTime;

      console.log(
        `Updated lastProcessedDate: ${lastProcessedDate}, lastProcessedTime: ${lastProcessedTime}`
      );
    }
  } catch (error) {
    console.error("Error checking new data:", error);
  }
}

// ดึงข้อมูลล่าสุดเมื่อเริ่ม server
async function initializeLastProcessedDateTime() {
  try {
    const latestRecord = await connection_server.query(
      "SELECT c_date, c_time FROM test ORDER BY c_date DESC, c_time DESC",
      { type: connection_server.QueryTypes.SELECT }
    );

    if (latestRecord.length > 0) {
      lastProcessedDate = latestRecord[0].c_date;
      lastProcessedTime = latestRecord[0].c_time;
      console.log(
        `Initialized lastProcessedDate: ${lastProcessedDate}, lastProcessedTime: ${lastProcessedTime}`
      );
    }
  } catch (error) {
    console.error("Error initializing last processed date and time:", error);
  }
}

// เริ่มต้น server
initializeLastProcessedDateTime();
setInterval(checkNewData, 5 * 1000);

// Route สำหรับ SSE
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write("data: Connected to SSE server\n\n");

  const clientId = Date.now();
  clients.push({ id: clientId, res });

  console.log(`Client connected: ${clientId}`);

  req.on("close", () => {
    clients = clients.filter((client) => client.id !== clientId);
    console.log(`Client disconnected: ${clientId}`);
  });
});

app.listen(port, () => {
  console.log(`SSE server is running on http://localhost:${port}`);
});

// Add a cleanup function to clear all timeouts when server shuts down
function cleanup() {
  for (const [data_id, timeout] of timeoutMap.entries()) {
    clearTimeout(timeout);
    console.log(`Cleared timeout for data_id: ${data_id}`);
  }
  timeoutMap.clear();
}

module.exports = { updateOfficeStatus, cleanup };
