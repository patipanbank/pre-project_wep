const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const Semester = require('../model/semester');

// Helper function to check overlapping dates within the same academic year
const checkOverlappingDates = async (startDate, endDate, year, excludeId = null) => {
    try {
        const overlappingSemesters = await Semester.findAll({
            where: {
                year: year,  // ตรวจสอบให้ปีตรงกัน
                [Op.and]: [
                    // เช็คว่าถ้า excludeId ถูกส่งมา ก็จะไม่นับ semester_id นั้น
                    excludeId ? { [Op.not]: [{ semester_id: excludeId }] } : {},
                    {
                        [Op.or]: [
                            { start_date: { [Op.between]: [startDate, endDate] } },
                            { end_date: { [Op.between]: [startDate, endDate] } },
                            {
                                [Op.and]: [
                                    { start_date: { [Op.lte]: startDate } },
                                    { end_date: { [Op.gte]: endDate } }
                                ]
                            }
                        ]
                    }
                ]
            }
        });

        // หากพบช่วงเวลาที่ซ้อนทับกันให้ return true
        return overlappingSemesters.length > 0;
    } catch (error) {
        console.error('Error checking overlapping dates:', error);
        throw new Error('Error checking overlapping dates: ' + error.message);
    }
};


// Create a new semester
router.post('/create', async (req, res) => {
    try {
        const { start_date, end_date, term, year } = req.body;

        // Validate input
        if (!start_date || !end_date || !term || !year) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // ตรวจสอบการมีอยู่ของ semester ที่มี term และ year เดียวกัน
        const existingSemester = await Semester.findOne({
            where: {
                term: term,
                year: year,
            },
        });

        if (existingSemester) {
            return res.status(400).json({ message: 'A semester for this term and year already exists.' });
        }

        // ตรวจสอบการซ้อนทับของวันที่
        const isOverlapping = await checkOverlappingDates(start_date, end_date, year);

        if (isOverlapping) {
            return res.status(400).json({ message: 'The dates overlap with an existing semester in the same academic year.' });
        }

        // สร้าง semester ใหม่
        const newSemester = await Semester.create({
            start_date,
            end_date,
            term,
            year,
        });

        res.status(201).json({
            message: 'Semester created successfully',
            data: newSemester,
        });
    } catch (error) {
        console.error('Error creating semester:', error);
        res.status(500).json({ message: 'Error creating semester: ' + error.message });
    }
});

// Update semester based on year and term
router.put('/update', async (req, res) => {
    const { start_date, end_date, term, year } = req.body;

    if (!start_date || !end_date || !term || !year) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // ตรวจสอบการซ้อนทับของวันที่เมื่ออัปเดต
        const isOverlapping = await checkOverlappingDates(start_date, end_date, year);

        if (isOverlapping) {
            return res.status(400).json({ message: 'The dates overlap with an existing semester in the same academic year.' });
        }

        // อัปเดต semester
        const [updated] = await Semester.update(
            { start_date, end_date },
            { where: { term, year } }
        );

        if (updated) {
            res.json({ message: 'Semester updated successfully!' });
        } else {
            res.status(404).json({ message: 'Semester not found for the given year and term' });
        }
    } catch (error) {
        console.error('Error updating semester:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Get all years
router.get('/years', async (req, res) => {
    try {
        const years = await Semester.findAll({
            attributes: ['year'],
            group: ['year'],
            order: [['year', 'ASC']],
        });
        res.json(years.map(semester => semester.year));
    } catch (error) {
        console.error('Error fetching years:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get all terms
router.get('/terms', async (req, res) => {
    try {
      const terms = await Semester.findAll({
        attributes: ['term'],
        group: ['term'],
        order: [['term', 'ASC']],
      });
      res.json(terms.map(semester => semester.term));
    } catch (error) {
      console.error('Error fetching terms:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Route to get terms by year
  router.get('/terms/byYear', async (req, res) => {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ error: 'Year is required' });
    }
  
    try {
      const terms = await Semester.findAll({
        attributes: ['term'],
        where: { year },
        group: ['term'],
        order: [['term', 'ASC']],
      });
      res.json(terms.map(semester => semester.term));
    } catch (error) {
      console.error('Error fetching terms by year:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// Get semesters for a specific year and term
router.get('/semesters', async (req, res) => {
    const { year, term } = req.query;

    if (!year || !term) {
        return res.status(400).json({ error: 'Year and term are required' });
    }

    try {
        const semesters = await Semester.findAll({
            where: {
                year,
                term,
            },
            order: [['start_date', 'ASC']],
        });
        res.json(semesters);
    } catch (error) {
        console.error('Error fetching semesters:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Delete semester based on year and term
router.delete('/delete', async (req, res) => {
    const { year, term } = req.body;

    // ตรวจสอบว่ามีการส่ง year และ term
    if (!year || !term) {
        return res.status(400).json({ message: 'Year and Term are required.' });
    }

    try {
        // ลบ semester ที่ตรงกับ year และ term
        const deleted = await Semester.destroy({
            where: { year, term }
        });

        if (deleted) {
            res.json({ message: 'Semester deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Semester not found for the given year and term.' });
        }
    } catch (error) {
        console.error('Error deleting semester:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
