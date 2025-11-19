const express = require('express');
const router = express.Router();
const eventApplicationsController = require('../controllers/eventApplicationsController');
const { verifyToken, verifyAdminToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation rules
const sponsorValidation = [
  body('event_id').isInt().withMessage('Valid event ID is required'),
  body('company_name').trim().isLength({ min: 1 }).withMessage('Company name is required'),
  body('contact_person').trim().isLength({ min: 1 }).withMessage('Contact person is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('sponsorship_level').optional().trim(),
  body('sponsorship_amount').optional().isFloat({ min: 0 }).withMessage('Sponsorship amount must be a positive number'),
  body('description').optional().trim()
];

const mediaPartnerValidation = [
  body('event_id').isInt().withMessage('Valid event ID is required'),
  body('organization_name').trim().isLength({ min: 1 }).withMessage('Organization name is required'),
  body('contact_person').trim().isLength({ min: 1 }).withMessage('Contact person is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('media_type').optional().trim(),
  body('audience_size').optional().trim(),
  body('coverage_areas').optional().trim(),
  body('partnership_type').optional().trim(),
  body('description').optional().trim()
];

const speakerValidation = [
  body('event_id').isInt().withMessage('Valid event ID is required'),
  body('full_name').trim().isLength({ min: 1 }).withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('organization').optional().trim(),
  body('position').optional().trim(),
  body('bio').optional().trim(),
  body('expertise').optional().trim(),
  body('topic').trim().isLength({ min: 1 }).withMessage('Topic is required'),
  body('presentation_type').optional().trim(),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('special_requirements').optional().trim(),
  body('linkedin_profile').optional().isURL().withMessage('Valid LinkedIn URL is required'),
  body('website').optional().isURL().withMessage('Valid website URL is required')
];

const guestValidation = [
  body('event_id').isInt().withMessage('Valid event ID is required'),
  body('full_name').trim().isLength({ min: 1 }).withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('organization').optional().trim(),
  body('position').optional().trim(),
  body('guest_type').optional().trim(),
  body('reason_for_attendance').optional().trim(),
  body('special_dietary_requirements').optional().trim(),
  body('accessibility_needs').optional().trim(),
  body('accompanying_guests').optional().isInt({ min: 0 }).withMessage('Accompanying guests must be a non-negative integer'),
  body('linkedin_profile').optional().isURL().withMessage('Valid LinkedIn URL is required'),
  body('website').optional().isURL().withMessage('Valid website URL is required')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User routes (for applying)
router.post('/sponsors',
  verifyToken,
  eventApplicationsController.createSponsor
);

router.post('/media-partners',
  verifyToken,
  eventApplicationsController.createMediaPartner
);

router.post('/speakers',
  verifyToken,
  eventApplicationsController.createSpeaker
);

router.post('/guests',
  verifyToken,
  eventApplicationsController.createGuest
);

// Admin routes (for managing applications)
router.get('/events/:id/sponsors', verifyAdminToken, eventApplicationsController.getSponsorsByEvent);
router.put('/sponsors/:id/status', verifyAdminToken, eventApplicationsController.updateSponsorStatus);

router.get('/events/:id/media-partners', verifyAdminToken, eventApplicationsController.getMediaPartnersByEvent);
router.put('/media-partners/:id/status', verifyAdminToken, eventApplicationsController.updateMediaPartnerStatus);

router.get('/events/:id/speakers', verifyAdminToken, eventApplicationsController.getSpeakersByEvent);
router.put('/speakers/:id/status', verifyAdminToken, eventApplicationsController.updateSpeakerStatus);

router.get('/events/:id/guests', verifyAdminToken, eventApplicationsController.getGuestsByEvent);
router.put('/guests/:id/status', verifyAdminToken, eventApplicationsController.updateGuestStatus);

module.exports = router;