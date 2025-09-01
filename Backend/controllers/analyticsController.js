const Note = require('../models/Note');
const User = require('../models/user');

// @desc    Get most active users (by number of notes created)
// @route   GET /api/analytics/active-users
// @access  Private/Admin
exports.getMostActiveUsers = async (req, res) => {
  try {
    const activeUsers = await Note.aggregate([
      {
        $group: {
          _id: '$user',
          noteCount: { $sum: 1 }
        }
      },
      {
        $sort: { noteCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 1,
          name: '$userInfo.name',
          email: '$userInfo.email',
          noteCount: 1
        }
      }
    ]);

    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get most used tags
// @route   GET /api/analytics/popular-tags
// @access  Private/Admin
exports.getMostUsedTags = async (req, res) => {
  try {
    const popularTags = await Note.aggregate([
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          tag: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(popularTags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notes created per day for last 7 days
// @route   GET /api/analytics/notes-per-day
// @access  Private/Admin
exports.getNotesPerDay = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const notesPerDay = await Note.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          count: 1,
          _id: 0
        }
      }
    ]);

    // Fill in missing dates with 0 count
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const existingEntry = notesPerDay.find(entry => entry.date === dateStr);
      result.push({
        date: dateStr,
        count: existingEntry ? existingEntry.count : 0
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overall analytics summary
// @route   GET /api/analytics/summary
// @access  Private/Admin
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalNotes = await Note.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalTags = await Note.distinct('tags');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notesToday = await Note.countDocuments({ createdAt: { $gte: today } });

    const summary = {
      totalNotes,
      totalUsers,
      uniqueTags: totalTags.length,
      notesToday
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 