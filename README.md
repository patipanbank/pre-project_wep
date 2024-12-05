1. use XAMPP for start Apache and MySQL
2. create new database name is project_web and choose uft8_unicode_ci
3. import project_web.sql file
4. create new database name is tenter_it and choose uft8_unicode_ci
5. click sql in table tenter_it and run script
   CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data_id VARCHAR(255) NOT NULL,
  c_date INT NOT NULL,
  c_time INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

6. run script in sql again
 DELIMITER $$

 CREATE TRIGGER after_insert_test
 AFTER INSERT ON test
 FOR EACH ROW
 BEGIN
   INSERT INTO notifications (data_id, c_date, c_time)
   VALUES (NEW.l_uid, NEW.c_date, NEW.c_time);
 END $$

 DELIMITER ;

7. open project in vscode
8. open terminal and use npm i nodemon
9. use npm install socket.io
10. npm install ws
11. use npm run run for start
12. in browser use part http://localhost:3001/login
//////// use lamduan mail only //////////

http://localhost:3001/student/homepage  for student
http://localhost:3001/teacher/homepage  for teacher
http://localhost:3001/admin/homepage  for admin

