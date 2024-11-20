1. use XAMPP for start Apache and MySQL
2. create new database name is project_web and choose uft8_unicode_ci
3. import project_web.sql file
4. open project in vscode
5. open terminal and use npm i nodemon
5. use npm run run for start

โปรเจคนี้ผมกำลังทำอยู่นะครับ ซึ่งส่วนที่จะสามารถแสดงให้ดูได้จะมี
1. http://localhost:3001/admin/manage หน้าจัดการข้อมูลบุคคลครับ 
      ซึ่งหน้านี้จะต้อง import ข้อมูลจาก excel file ที่ผมได้แนบไว้ให้นะครับ

2. http://localhost:3001/admin/semester หน้าสร้าง อัพเดท และลบปีการศึกษาครับ

3. http://localhost:3001/admin/officehours หน้าจัดการตารางครับ
      หน้านี้ต้องสร้างปีการศึกษาก่อนนะครับถึงจะสามารถเพิ่ม officehours ได้ครับ

เป็นเว็บเกี่ยวกับการนัดหมายอาจารย์นะครับ ซึ่งอยู่ระหว่างการทำครับ


CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data_id VARCHAR(255) NOT NULL,
  c_date INT NOT NULL,
  c_time INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

//////////////////////////////////////////////////////

DELIMITER $$

CREATE TRIGGER after_insert_test
AFTER INSERT ON test
FOR EACH ROW
BEGIN
  INSERT INTO notifications (data_id, c_date, c_time)
  VALUES (NEW.l_uid, NEW.c_date, NEW.c_time);
END $$

DELIMITER ;

///////////////////////////////////////////////////////
npm  install socket.io