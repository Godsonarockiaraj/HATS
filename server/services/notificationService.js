const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Create notification for application status change
  static async createApplicationStatusNotification(application, oldStatus, newStatus, changedBy) {
    try {
      const notification = new Notification({
        user: application.applicantId,
        type: 'status_update',
        message: `Your application for ${application.jobId.title} status has been changed from ${oldStatus} to ${newStatus}`,
        metadata: {
          oldStatus,
          newStatus,
          changedBy: changedBy._id,
          changedByRole: changedBy.role
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating application status notification:', error);
      throw error;
    }
  }

  // Create notification for new job posted
  static async createNewJobNotification(job) {
    try {
      // Get all applicant users
      const applicants = await User.find({ role: 'applicant' });
      
      const notifications = applicants.map(applicant => ({
        user: applicant._id,
        type: 'job_created',
        message: `A new job "${job.title}" has been posted in the ${job.department} department`,
        link: `/jobs/${job._id}`
      }));

      await Notification.insertMany(notifications);
      return notifications;
    } catch (error) {
      console.error('Error creating new job notifications:', error);
      throw error;
    }
  }

  // Create notification for new technical application (for bot and admin)
  static async createNewTechnicalApplicationNotification(application) {
    try {
      // Get all bot_mimic and admin users
      const botAndAdminUsers = await User.find({ 
        role: { $in: ['bot_mimic', 'admin'] } 
      });
      
      const notifications = botAndAdminUsers.map(user => ({
        user: user._id,
        type: 'new_technical_application',
        title: 'New Technical Application Received',
        message: `A new technical application has been received for ${application.jobId.title} from ${application.applicantId.name || application.applicantId.email}`,
        metadata: {
          applicantName: application.applicantId.name || application.applicantId.email,
          applicantEmail: application.applicantId.email,
          jobTitle: application.jobId.title,
          department: application.jobId.department
        }
      }));

      await Notification.insertMany(notifications);
      return notifications;
    } catch (error) {
      console.error('Error creating new technical application notifications:', error);
      throw error;
    }
  }

  // Create notification for application feedback
  static async createFeedbackNotification(application, feedback, givenBy) {
    try {
      const notification = new Notification({
        user: application.applicantId,
        type: 'feedback',
        message: `You have received feedback for your application to ${application.jobId.title}`,
        metadata: {
          feedback,
          givenBy: givenBy._id,
          givenByRole: givenBy.role
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating feedback notification:', error);
      throw error;
    }
  }

  // Create notification for interview scheduled
  static async createInterviewScheduledNotification(application, interviewDetails, scheduledBy) {
    try {
      const notification = new Notification({
        user: application.applicantId,
        type: 'interview_scheduled',
        message: `An interview has been scheduled for your application to ${application.jobId.title}`,
        metadata: {
          interviewDetails,
          scheduledBy: scheduledBy._id,
          scheduledByRole: scheduledBy.role
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating interview scheduled notification:', error);
      throw error;
    }
  }

  // Create notification for offer made
  static async createOfferNotification(application, offerDetails, madeBy) {
    try {
      const notification = new Notification({
        user: application.applicantId,
        type: 'offer_made',
        message: `Congratulations! You have received a job offer for ${application.jobId.title}`,
        metadata: {
          offerDetails,
          madeBy: madeBy._id,
          madeByRole: madeBy.role
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating offer notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;



