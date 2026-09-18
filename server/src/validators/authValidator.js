export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validateSignupRequest = (req, res, next) => {
  const { name, email } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Please provide a valid full name.' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }
  next();
};

export const validateLoginRequest = (req, res, next) => {
  const { email } = req.body;
  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }
  next();
};
