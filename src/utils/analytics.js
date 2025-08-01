// Simple analytics utility for Google Analytics
// Tracks only total users and daily active users

// Check if Google Analytics is available
const isGAvailable = () => {
  return typeof window !== 'undefined' && window.gtag;
};

// Debug function to log analytics events
const logAnalyticsEvent = (eventName, data) => {
  console.log(`Analytics Event: ${eventName}`, data);
};



// Track page view
export const trackPageView = (pageName) => {
  if (isGAvailable()) {
    window.gtag('config', 'G-Q0VQP0H87Q', {
      page_title: pageName,
      page_location: window.location.href
    });
    logAnalyticsEvent('page_view', { pageName, url: window.location.href });
  } else {
    console.log('Google Analytics not available for page view');
  }
};

// Track user login (for daily active users)
export const trackUserLogin = () => {
  if (isGAvailable()) {
    window.gtag('event', 'login', {
      event_category: 'engagement',
      event_label: 'user_login'
    });
    logAnalyticsEvent('login', { category: 'engagement', label: 'user_login' });
  } else {
    console.log('Google Analytics not available for login tracking');
  }
};



// Track timetable refresh
export const trackTimetableRefresh = () => {
  if (isGAvailable()) {
    window.gtag('event', 'timetable_refresh', {
      event_category: 'engagement',
      event_label: 'refresh_timetable'
    });
    logAnalyticsEvent('timetable_refresh', { category: 'engagement', label: 'refresh_timetable' });
  } else {
    console.log('Google Analytics not available for timetable refresh tracking');
  }
};

// Track subject mapping usage
export const trackSubjectMapping = () => {
  if (isGAvailable()) {
    window.gtag('event', 'subject_mapping', {
      event_category: 'engagement',
      event_label: 'map_subject'
    });
    logAnalyticsEvent('subject_mapping', { category: 'engagement', label: 'map_subject' });
  } else {
    console.log('Google Analytics not available for subject mapping tracking');
  }
}; 