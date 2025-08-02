// API Configuration
// These URLs are loaded from environment variables for security

export const API_CONFIG = {
  // CAPTCHA endpoint
  CAPTCHA_URL: import.meta.env.VITE_CAPTCHA_URL,
  
  // Login/Data fetch endpoint
  FETCH_URL: import.meta.env.VITE_FETCH_URL,
};

// iOS detection utility
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Semester mapping
export const SEMESTER_MAP = {
  'odd': '1',
  'even': '2', 
  'summer': '3'
};


export const getAcademicYearCode = (academicYear) => {
  const firstYear = parseInt(academicYear.split('-')[0]);
  return (16 + (firstYear - 2024) * 3).toString();
};

// Helper function to generate captcha URL with timestamp
export const getCaptchaUrl = () => {
  return `${API_CONFIG.CAPTCHA_URL}?ts=${Date.now()}`;
};

// Helper function to get form data with common fields
export const getFormData = (username, password, captcha, semester, academicYear) => {
  const form = new FormData();
  
  // iOS Safari sometimes has issues with FormData, so we ensure proper encoding
  const academicYearCode = getAcademicYearCode(academicYear);
  const semesterId = SEMESTER_MAP[semester];
  
  // Use append with explicit string conversion for iOS compatibility
  form.append("username", String(username).trim());
  form.append("password", String(password));
  form.append("captcha", String(captcha).trim());
  form.append("academic_year_code", String(academicYearCode));
  form.append("semester_id", String(semesterId));
  
  // For iOS debugging
  if (isIOS()) {
    console.log('FormData created for iOS:');
    console.log('Username:', username);
    console.log('Academic Year Code:', academicYearCode);
    console.log('Semester ID:', semesterId);
    console.log('Captcha:', captcha);
  }
  
  return form;
};

// Fallback function for iOS Safari FormData issues
export const getFormDataFallback = (username, password, captcha, semester, academicYear) => {
  const academicYearCode = getAcademicYearCode(academicYear);
  const semesterId = SEMESTER_MAP[semester];
  
  const params = new URLSearchParams();
  params.append("username", String(username).trim());
  params.append("password", String(password));
  params.append("captcha", String(captcha).trim());
  params.append("academic_year_code", String(academicYearCode));
  params.append("semester_id", String(semesterId));
  
  if (isIOS()) {
    console.log('Using URLSearchParams fallback for iOS:');
    console.log('Params:', params.toString());
  }
  
  return params;
};

// Helper function to get current academic year options
export const getCurrentAcademicYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const options = [];
  
  // Add current year and previous year
  options.push(`${currentYear-1}-${currentYear.toString().slice(-2)}`);
  options.push(`${currentYear}-${(currentYear+1).toString().slice(-2)}`);
  
  return options;
}; 