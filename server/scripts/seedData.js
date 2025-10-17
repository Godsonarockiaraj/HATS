const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ActivityLog = require('../models/ActivityLog');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mernapp';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await ActivityLog.deleteMany({});

    // Create users
    const users = await User.create([
      {
        name: 'John Applicant',
        email: 'applicant@demo.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'applicant'
      },
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'password123',
        phone: '+1234567891',
        role: 'admin'
      },
      {
        name: 'Bot Mimic',
        email: 'bot@demo.com',
        password: 'password123',
        phone: '+1234567892',
        role: 'bot_mimic'
      }
    ]);

    console.log('Created users:', users.length);

    // Create jobs
    const jobs = await Job.create([
      {
        title: 'Senior Software Engineer',
        description: 'We are looking for a senior software engineer with 5+ years of experience in React, Node.js, and MongoDB.',
        department: 'Engineering',
        isTechnical: true,
        createdBy: users[1]._id
      },
      {
        title: 'Frontend Developer',
        description: 'Join our frontend team to build amazing user experiences with React and modern web technologies.',
        department: 'Engineering',
        isTechnical: true,
        createdBy: users[1]._id
      },
      {
        title: 'Marketing Manager',
        description: 'Lead our marketing initiatives and drive growth through strategic campaigns and brand management.',
        department: 'Marketing',
        isTechnical: false,
        createdBy: users[1]._id
      },
      {
        title: 'HR Coordinator',
        description: 'Support our human resources team in recruitment, employee relations, and administrative tasks.',
        department: 'Human Resources',
        isTechnical: false,
        createdBy: users[1]._id
      },
      {
        title: 'DevOps Engineer',
        description: 'Manage our cloud infrastructure and deployment pipelines using AWS, Docker, and Kubernetes.',
        department: 'Engineering',
        isTechnical: true,
        createdBy: users[1]._id
      }
    ]);

    console.log('Created jobs:', jobs.length);

    // Create applications
    const applications = await Application.create([
      {
        applicantId: users[0]._id,
        jobId: jobs[0]._id,
        status: 'pending',
        personalInfo: {
          fullName: 'John Applicant',
          email: 'applicant@demo.com',
          phone: '+1234567890',
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        professionalInfo: {
          currentPosition: 'Software Developer',
          currentCompany: 'Tech Corp',
          yearsOfExperience: 5,
          currentSalary: '80000',
          expectedSalary: '95000',
          noticePeriod: '2 weeks',
          availability: 'Immediately'
        },
        education: [{
          degree: 'Bachelor of Science',
          institution: 'University of Technology',
          fieldOfStudy: 'Computer Science',
          graduationYear: 2019,
          gpa: '3.8'
        }],
        workExperience: [{
          company: 'Tech Corp',
          position: 'Software Developer',
          startDate: new Date('2020-01-01'),
          endDate: null,
          current: true,
          description: 'Developed web applications using React and Node.js'
        }],
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
        coverLetter: 'I am excited to apply for the Senior Software Engineer position...',
        additionalInfo: {
          whyInterested: 'I am passionate about building scalable web applications and want to work with cutting-edge technologies.',
          relevantProjects: 'Built a full-stack e-commerce platform using MERN stack with real-time features.',
          certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
          languages: ['English', 'Spanish', 'French'],
          references: [{
            name: 'Jane Smith',
            position: 'Senior Developer',
            company: 'Tech Corp',
            email: 'jane.smith@techcorp.com',
            phone: '+1234567891'
          }]
        }
      },
      {
        applicantId: users[0]._id,
        jobId: jobs[1]._id,
        status: 'pending',
        personalInfo: {
          fullName: 'John Applicant',
          email: 'applicant@demo.com',
          phone: '+1234567890',
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        professionalInfo: {
          currentPosition: 'Frontend Developer',
          currentCompany: 'Web Solutions Inc',
          yearsOfExperience: 3,
          currentSalary: '70000',
          expectedSalary: '85000',
          noticePeriod: '1 month',
          availability: 'Next month'
        },
        education: [{
          degree: 'Bachelor of Arts',
          institution: 'Design University',
          fieldOfStudy: 'Graphic Design',
          graduationYear: 2020,
          gpa: '3.6'
        }],
        workExperience: [{
          company: 'Web Solutions Inc',
          position: 'Frontend Developer',
          startDate: new Date('2021-03-01'),
          endDate: null,
          current: true,
          description: 'Created responsive web interfaces using React and Vue.js'
        }],
        skills: ['React', 'Vue.js', 'CSS', 'HTML', 'JavaScript', 'TypeScript'],
        coverLetter: 'I have extensive experience in React and modern frontend technologies...',
        additionalInfo: {
          whyInterested: 'I love creating beautiful and functional user interfaces that provide great user experience.',
          relevantProjects: 'Developed a dashboard application with real-time data visualization using D3.js.',
          certifications: ['React Developer Certification'],
          languages: ['English', 'Portuguese'],
          references: [{
            name: 'Mike Johnson',
            position: 'Lead Designer',
            company: 'Web Solutions Inc',
            email: 'mike.johnson@websolutions.com',
            phone: '+1234567892'
          }]
        }
      },
      {
        applicantId: users[0]._id,
        jobId: jobs[2]._id,
        status: 'pending',
        personalInfo: {
          fullName: 'John Applicant',
          email: 'applicant@demo.com',
          phone: '+1234567890',
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        professionalInfo: {
          currentPosition: 'Marketing Coordinator',
          currentCompany: 'Creative Agency',
          yearsOfExperience: 4,
          currentSalary: '60000',
          expectedSalary: '75000',
          noticePeriod: '3 weeks',
          availability: 'In 2 weeks'
        },
        education: [{
          degree: 'Master of Business Administration',
          institution: 'Business School',
          fieldOfStudy: 'Marketing',
          graduationYear: 2018,
          gpa: '3.9'
        }],
        workExperience: [{
          company: 'Creative Agency',
          position: 'Marketing Coordinator',
          startDate: new Date('2019-06-01'),
          endDate: null,
          current: true,
          description: 'Managed digital marketing campaigns and brand development'
        }],
        skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Analytics', 'SEO'],
        coverLetter: 'I have a strong background in marketing and brand management...',
        additionalInfo: {
          whyInterested: 'I am excited about the opportunity to lead marketing initiatives and drive brand growth.',
          relevantProjects: 'Launched a successful social media campaign that increased brand awareness by 150%.',
          certifications: ['Google Analytics Certified', 'HubSpot Content Marketing'],
          languages: ['English', 'German'],
          references: [{
            name: 'Sarah Wilson',
            position: 'Marketing Director',
            company: 'Creative Agency',
            email: 'sarah.wilson@creativeagency.com',
            phone: '+1234567893'
          }]
        }
      }
    ]);

    console.log('Created applications:', applications.length);

    // Create keywords for technical jobs
    const Keyword = require('../models/Keyword');
    const keywords = await Keyword.create([
      // Keywords for Senior Software Engineer
      { 
        job: jobs[0]._id, 
        type: 'required',
        keyword: 'react',
        category: 'technology',
        weight: 8,
        createdBy: users[1]._id
      },
      { 
        job: jobs[0]._id, 
        type: 'required',
        keyword: 'node.js',
        category: 'technology',
        weight: 9,
        createdBy: users[1]._id
      },
      { 
        job: jobs[0]._id, 
        type: 'required',
        keyword: 'mongodb',
        category: 'technology',
        weight: 7,
        createdBy: users[1]._id
      },
      { 
        job: jobs[0]._id, 
        type: 'required',
        keyword: 'javascript',
        category: 'technology',
        weight: 8,
        createdBy: users[1]._id
      },
      
      // Keywords for Frontend Developer
      { 
        job: jobs[1]._id, 
        type: 'required',
        keyword: 'react',
        category: 'technology',
        weight: 9,
        createdBy: users[1]._id
      },
      { 
        job: jobs[1]._id, 
        type: 'preferred',
        keyword: 'vue.js',
        category: 'technology',
        weight: 7,
        createdBy: users[1]._id
      },
      { 
        job: jobs[1]._id, 
        type: 'preferred',
        keyword: 'angular',
        category: 'technology',
        weight: 6,
        createdBy: users[1]._id
      },
      { 
        job: jobs[1]._id, 
        type: 'required',
        keyword: 'css',
        category: 'technology',
        weight: 8,
        createdBy: users[1]._id
      }
    ]);

    console.log('Created keywords:', keywords.length);

    // Create activity logs
    const activityLogs = await ActivityLog.create([
      {
        user: users[0]._id,
        action: 'application_submitted',
        targetType: 'application',
        targetId: applications[0]._id,
        description: 'Application submitted successfully'
      },
      {
        user: users[0]._id,
        action: 'application_submitted',
        targetType: 'application',
        targetId: applications[1]._id,
        description: 'Application submitted successfully'
      },
      {
        user: users[2]._id,
        action: 'application_reviewed',
        targetType: 'application',
        targetId: applications[1]._id,
        description: 'Application reviewed by automated system. Candidate meets initial requirements.'
      },
      {
        user: users[0]._id,
        action: 'application_submitted',
        targetType: 'application',
        targetId: applications[2]._id,
        description: 'Application submitted successfully'
      },
      {
        user: users[1]._id,
        action: 'interview_scheduled',
        targetType: 'application',
        targetId: applications[2]._id,
        description: 'Interview scheduled for next week. Candidate shows strong potential.'
      }
    ]);

    console.log('Created activity logs:', activityLogs.length);

    console.log('Database seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('Applicant: applicant@demo.com / password123');
    console.log('Admin: admin@demo.com / password123');
    console.log('Bot Mimic: bot@demo.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedData();
