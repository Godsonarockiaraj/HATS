import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  TrendingUpIcon, 
  UsersIcon, 
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  LocationIcon,
  DollarSignIcon,
  ClockIcon
} from './ProfessionalIcons';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredJob, setHoveredJob] = useState(null);

  // Ensure consistent landing page display
  useEffect(() => {
    // Clear any potential auth state issues and reset component state
    console.log('LandingPage mounted - ensuring consistent display');
    
    // Reset any hover states
    setHoveredJob(null);
    
    // Force a clean render
    return () => {
      console.log('LandingPage unmounting');
    };
  }, []);

  const quotes = [
    "Your dream job is just one application away",
    "Unlock your potential with the right opportunity",
    "Great careers start with great applications",
    "Find your perfect match in the job market",
    "Success begins with the right opportunity"
  ];

  const features = [
    {
      icon: <TrendingUpIcon />,
      title: "AI-Powered Matching",
      description: "Our advanced AI matches you with the perfect job opportunities"
    },
    {
      icon: <UsersIcon />,
      title: "Top Companies",
      description: "Access exclusive jobs from leading companies worldwide"
    },
    {
      icon: <BriefcaseIcon />,
      title: "Easy Applications",
      description: "Apply to multiple jobs with just one click"
    },
    {
      icon: <CheckCircleIcon />,
      title: "Real-time Updates",
      description: "Get instant notifications about your application status"
    }
  ];

  const jobOffers = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      salary: "$120,000 - $180,000",
      type: "Full-time",
      experience: "5+ years",
      skills: ["React", "Node.js", "Python"],
      description: "Join our innovative team building cutting-edge web applications",
      featured: true
    },
    {
      id: 2,
      title: "Data Scientist",
      company: "DataFlow Solutions",
      location: "New York, NY",
      salary: "$130,000 - $200,000",
      type: "Full-time",
      experience: "3+ years",
      skills: ["Machine Learning", "Python", "SQL"],
      description: "Work with big data and machine learning algorithms",
      featured: true
    },
    {
      id: 3,
      title: "Product Manager",
      company: "InnovateLab",
      location: "Seattle, WA",
      salary: "$140,000 - $220,000",
      type: "Full-time",
      experience: "4+ years",
      skills: ["Product Strategy", "Agile", "Analytics"],
      description: "Lead product development for our flagship platform",
      featured: false
    },
    {
      id: 4,
      title: "DevOps Engineer",
      company: "CloudTech",
      location: "Austin, TX",
      salary: "$110,000 - $160,000",
      type: "Full-time",
      experience: "3+ years",
      skills: ["AWS", "Docker", "Kubernetes"],
      description: "Build and maintain scalable cloud infrastructure",
      featured: false
    },
    {
      id: 5,
      title: "UX Designer",
      company: "DesignStudio",
      location: "Los Angeles, CA",
      salary: "$90,000 - $140,000",
      type: "Full-time",
      experience: "2+ years",
      skills: ["Figma", "User Research", "Prototyping"],
      description: "Create beautiful and intuitive user experiences",
      featured: false
    },
    {
      id: 6,
      title: "Marketing Director",
      company: "GrowthCo",
      location: "Chicago, IL",
      salary: "$100,000 - $150,000",
      type: "Full-time",
      experience: "5+ years",
      skills: ["Digital Marketing", "Analytics", "Strategy"],
      description: "Drive growth through innovative marketing strategies",
      featured: false
    }
  ];

  const handleApplyClick = (jobId) => {
    // Redirect to login page
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find Your <span className="gradient-text">Dream Job</span>
            </h1>
            <p className="hero-subtitle">
              {quotes[Math.floor(Math.random() * quotes.length)]}
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Active Jobs</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Companies</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">1M+</div>
                <div className="stat-label">Success Stories</div>
              </div>
            </div>
            <div className="hero-actions">
              <button className="btn-primary btn-large" onClick={handleGetStarted}>
                Get Started
                <ArrowRightIcon />
              </button>
              <button className="btn-secondary btn-large">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Our Platform?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Offers Section */}
      <section className="job-offers-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Job Opportunities</h2>
            <p className="section-subtitle">Discover high-paying positions from top companies</p>
          </div>
          
          <div className="job-offers-grid">
            {jobOffers.map((job) => (
              <div 
                key={job.id} 
                className={`job-card ${job.featured ? 'featured' : ''}`}
                onMouseEnter={() => setHoveredJob(job.id)}
                onMouseLeave={() => setHoveredJob(null)}
              >
                {job.featured && (
                  <div className="featured-badge">
                    <StarIcon />
                    Featured
                  </div>
                )}
                
                <div className="job-header">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-company">{job.company}</p>
                </div>
                
                <div className="job-details">
                  <div className="job-detail">
                    <LocationIcon />
                    <span>{job.location}</span>
                  </div>
                  <div className="job-detail">
                    <DollarSignIcon />
                    <span className="salary">{job.salary}</span>
                  </div>
                  <div className="job-detail">
                    <ClockIcon />
                    <span>{job.type}</span>
                  </div>
                </div>
                
                <p className="job-description">{job.description}</p>
                
                <div className="job-skills">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
                
                <div className="job-footer">
                  <span className="experience-required">{job.experience} experience</span>
                  <button 
                    className="apply-btn"
                    onClick={() => handleApplyClick(job.id)}
                  >
                    Apply Now
                    <ArrowRightIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cta-section">
            <h3>Ready to Start Your Journey?</h3>
            <p>Join thousands of professionals who found their dream jobs</p>
            <button className="btn-primary btn-large" onClick={handleGetStarted}>
              Create Your Profile
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Job Portal</h4>
              <p>Connecting talent with opportunity</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#jobs">Browse Jobs</a></li>
                <li><a href="#companies">Companies</a></li>
                <li><a href="#careers">Careers</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Job Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
