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

DELIMITER $$

CREATE TRIGGER after_insert_test
AFTER INSERT ON test
FOR EACH ROW
BEGIN
  INSERT INTO notifications (data_id, c_date, c_time)
  VALUES (NEW.l_uid, NEW.c_date, NEW.c_time);
END $$

DELIMITER ;


if (item.status !== "in_office") {
        return null; // Return null if the status is not "in_office"
    }


   function updateCardStyle(id, available) {
            const card = document.getElementById(`card-${id}`);
            if (available === 'off') {
                card.style.opacity = '0.5';
            } else {
                card.style.opacity = '1';
            }
        }

        function reorderCards() {
            const cardContainer = document.getElementById('cardContainer');
            const cards = Array.from(cardContainer.getElementsByClassName('card'));

            cards.sort((a, b) => {
                const availableA = a.querySelector('.form-check-input').checked ? 0 : 1;
                const availableB = b.querySelector('.form-check-input').checked ? 0 : 1;
                return availableA - availableB;
            });

            cards.forEach(card => cardContainer.appendChild(card));
        }

        document.addEventListener('DOMContentLoaded', function () {
    fetch('/data/images')
        .then(response => response.json())
        .then(data => {
            const cardContainer = document.getElementById('cardContainer');
            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card text-center'; // เพิ่ม text-center เพื่อจัดกลางเนื้อหาทั้งหมด
                card.id = `card-${item.data_id}`;
                card.innerHTML = ` 
                    <div class="card-header p-2"> <!-- เพิ่ม card-header สำหรับ dropdown -->
                        <select class="aa form-select form-select-sm mx-auto" style="width: 150px;" 
                                onchange="updateStatus(${item.data_id}, this.value)" 
                                id="status-${item.data_id}">
                            <option value="in_office" ${item.status === 'in_office' ? 'selected' : ''}>In Office</option>
                            <option value="out_office" ${item.status === 'out_office' ? 'selected' : ''}>Out Office</option>
                            <option value="Leave" ${item.status === 'Leave' ? 'selected' : ''}>Leave</option>
                        </select>
                    </div>
                    <div class="image-container"> <!-- เพิ่ม container สำหรับรูปภาพ -->
                        <img src="${item.image || 'https://via.placeholder.com/150'}" class="card-img-top" alt="Image">
                    </div>
                    <div class="card-body d-flex flex-column align-items-center"> <!-- จัดการ card-body ให้อยู่กึ่งกลาง -->
                        <h5 class="card-title" style="font-size: 17px;">${item.name}</h5>
                        <p class="card-text mb-1">Major: ${item.major}</p>
                        <p class="card-text mb-1">Email: ${item.email}</p>
                        <p class="card-text mb-2">Tel: ${item.tel}</p>
                        <div class="mt-auto w-100 d-flex justify-content-center">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="available-${item.data_id}" 
                                ${item.available === 'on' ? 'checked' : ''} 
                                onchange="toggleAvailability(${item.data_id})">
                            <label class="form-check-label" for="available-${item.data_id}">Available</label>
                        </div>
                    </div>
                    </div>
                `;
                cardContainer.appendChild(card);

                // เรียกใช้ updateCardStatusStyle เพื่ออัปเดตสีของการ์ดตามสถานะ
                updateCardStatusStyle(item.data_id, item.status);

                updateCardStyle(item.data_id, item.available);
            });
            reorderCards();
        })
        .catch(error => console.error('Error fetching data:', error));
});