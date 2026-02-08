import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Users, 
  Settings, 
  FileText,
  Calendar,
  PieChart,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/CardNav.css';

const CardNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  const cardItems = [
    {
      title: "Profile",
      description: "Settings and preferences",
      icon: <User className="nav-card-icon" size={20} />,
      action: () => {
        setIsOpen(false);
        navigate("/profile");
      },
    },
    {
      title: "Day Review",
      description: "How your workday unfolded",
      icon: <PieChart className="nav-card-icon" size={20} />,
      action: () => {
        setIsOpen(false);
        navigate("/daily-summary"); // Changed to navigate to EndOfDaySummary
      }
    },
    {
      title: "Analytics",
      description: "Weekly and monthly analytics",
      icon: <FileText className="nav-card-icon" size={20} />,
      action: () => {
        setIsOpen(false);
        navigate("/analytics"); // Changed to navigate to AnalyticsDashboard
      }
    },
    {
      title: "Team",
      description: "Collaboration and members",
      icon: <Users className="nav-card-icon" size={20} />,
      action: () => {
        setIsOpen(false);
        navigate("/team"); // ADDED: Navigate to Team page
      }
    }
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyPress = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className="card-nav-container" ref={contentRef}>
      <div className={`card-nav ${isOpen ? 'open' : ''}`}>
        <div className="card-nav-top">
          <div 
            className={`hamburger-menu ${isOpen ? 'open' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            onKeyPress={(e) => handleKeyPress(e, () => setIsOpen(!isOpen))}
            role="button"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            tabIndex={0}
          >
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </div>
        </div>

        {isOpen && (
          <div className="card-nav-content">
            <div className="nav-header">
              <BarChart3 className="nav-main-icon" size={24} />
              <div className="nav-header-text">
                <h3>Quick Access</h3>
                <p>Navigate to key sections</p>
              </div>
            </div>
            <div className="nav-cards-container">
              {cardItems.map((item, index) => (
                <div 
                  key={index}
                  className="nav-card"
                  onClick={item.action}
                  onKeyPress={(e) => handleKeyPress(e, item.action)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to ${item.title}: ${item.description}`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="nav-card-icon-wrapper">
                    {item.icon}
                  </div>
                  <div className="nav-card-label">{item.title}</div>
                  <div className="nav-card-description">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardNav;