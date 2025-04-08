import Session from '../models/session.model.js';
import logger from '../utils/logger.js';

// Create a new session
const createSession = async (sessionData) => {
  try {
    // Create new session
    const session = new Session(sessionData);
    await session.save();
    
    return session.toObject();
  } catch (error) {
    logger.error('Create session service error:', error);
    throw error;
  }
};

// Get all sessions with pagination and filtering
const getAllSessions = async (page, limit, filter = {}) => {
  try {
    const skip = (page - 1) * limit;
    
    // Get sessions with pagination
    const sessions = await Session.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ date: -1, startTime: 1 })
      .select('-__v')
      .lean();
    
    // Get total count for pagination
    const total = await Session.countDocuments(filter);
    
    return {
      sessions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all sessions service error:', error);
    throw error;
  }
};

// Get session by ID
const getSessionById = async (id) => {
  try {
    return await Session.findById(id).select('-__v').lean();
  } catch (error) {
    logger.error('Get session by ID service error:', error);
    throw error;
  }
};

// Update session
const updateSession = async (id, updateData) => {
  try {
    const session = await Session.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v').lean();
    
    return session;
  } catch (error) {
    logger.error('Update session service error:', error);
    throw error;
  }
};

// Delete session
const deleteSession = async (id) => {
  try {
    const result = await Session.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    logger.error('Delete session service error:', error);
    throw error;
  }
};

// Get sessions for a class
const getSessionsByClass = async (classId, filter = {}) => {
  try {
    const sessions = await Session.find({
      classId,
      ...filter
    })
    .sort({ date: -1, startTime: 1 })
    .lean();
    
    return sessions;
  } catch (error) {
    logger.error('Get sessions by class service error:', error);
    throw error;
  }
};

// Update session statuses (e.g., to mark sessions as in-progress or completed)
const updateSessionStatuses = async () => {
  try {
    const now = new Date();
    
    // Update scheduled sessions to in-progress if their start time has passed
    await Session.updateMany(
      {
        status: 'scheduled',
        date: {
          $lte: now // Today or earlier
        },
        $expr: {
          $lte: [
            {
              $concat: [
                { $toString: { $year: '$date' } },
                '-',
                { $toString: { $month: '$date' } },
                '-',
                { $toString: { $dayOfMonth: '$date' } },
                'T',
                '$startTime',
                ':00'
              ]
            },
            now.toISOString()
          ]
        }
      },
      { status: 'in-progress' }
    );
    
    // Update in-progress sessions to completed if their end time has passed
    await Session.updateMany(
      {
        status: 'in-progress',
        date: {
          $lte: now // Today or earlier
        },
        $expr: {
          $lte: [
            {
              $concat: [
                { $toString: { $year: '$date' } },
                '-',
                { $toString: { $month: '$date' } },
                '-',
                { $toString: { $dayOfMonth: '$date' } },
                'T',
                '$endTime',
                ':00'
              ]
            },
            now.toISOString()
          ]
        }
      },
      { status: 'completed' }
    );
    
    logger.info('Session statuses updated');
  } catch (error) {
    logger.error('Update session statuses service error:', error);
    throw error;
  }
};

export default {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
  getSessionsByClass,
  updateSessionStatuses
};