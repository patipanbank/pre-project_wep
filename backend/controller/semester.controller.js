const Semester = require('../model/semester');

// Create a new semester
exports.createSemester = async (req, res) => {
  const { term, year } = req.body;

  try {
    // Input validation
    if (!term || !year) {
      return res.status(400).json({ error: 'Term and year are required.' });
    }

    // Check if the semester already exists
    const existingSemester = await Semester.findOne({
      where: { term, year },
    });

    if (existingSemester) {
      return res.status(400).json({ message: 'Semester already exists.' });
    }

    // Create the new semester
    const newSemester = await Semester.create({
      term,
      year,
      created_at: new Date(),
    });

    return res.status(201).json({
      message: 'Semester created successfully',
      data: newSemester,
    });
  } catch (error) {
    console.error('Error creating semester:', error);
    return res.status(500).json({ message: 'Error creating semester' });
  }
};
