// User Roles
export const ROLES = {
    CITIZEN: 'CITIZEN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    CENTER_ADMIN: 'CENTER_ADMIN',
    OPERATOR: 'OPERATOR',
};

// Appointment Statuses
export const STATUSES = {
    PENDING: 'Pending',
    CHECKED_IN: 'Checked In',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',
};

// Allowed status transitions
export const ALLOWED_TRANSITIONS = {
    'Pending': ['Checked In', 'Cancelled', 'No Show'],
    'Checked In': ['In Progress', 'Cancelled'],
    'In Progress': ['Completed', 'Cancelled'],
    'Completed': [],
    'Cancelled': [],
    'No Show': [],
};

// Time Slots
export const TIME_SLOTS = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
];

// Indian States
export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

// Service Types
export const SERVICE_TYPES = {
    NEW_ENROLLMENT: 'New Aadhaar Enrollment',
    BIOMETRIC_UPDATE: 'Biometric Update',
    DEMOGRAPHIC_UPDATE: 'Demographic Update',
    ADDRESS_UPDATE: 'Address Update',
    MOBILE_UPDATE: 'Mobile Number Update',
    EMAIL_UPDATE: 'Email Update',
    NAME_UPDATE: 'Name Update',
    DOB_UPDATE: 'Date of Birth Update',
    GENDER_UPDATE: 'Gender Update',
    AADHAAR_REPRINT: 'Aadhaar Reprint',
    CHILD_AADHAAR: 'Child Aadhaar Enrollment',
};

// Document Types
export const DOCUMENT_TYPES = {
    POI: 'Proof of Identity',
    POA: 'Proof of Address',
    DOB: 'Proof of Date of Birth',
    RELATIONSHIP: 'Proof of Relationship',
};

// Role to dashboard path mapping
export const ROLE_DASHBOARD_PATHS = {
    [ROLES.CITIZEN]: '/citizen/dashboard',
    [ROLES.OPERATOR]: '/operator/dashboard',
    [ROLES.CENTER_ADMIN]: '/center-admin/dashboard',
    [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
};

// Role labels for display
export const ROLE_LABELS = {
    [ROLES.CITIZEN]: 'Citizen',
    [ROLES.OPERATOR]: 'Operator',
    [ROLES.CENTER_ADMIN]: 'Center Admin',
    [ROLES.SUPER_ADMIN]: 'Super Admin',
};

// Capacity constants
export const CAPACITY = {
    SLOTS_PER_OPERATOR: 20,
    APPOINTMENTS_PER_SLOT: 5,
};
