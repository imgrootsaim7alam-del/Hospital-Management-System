export type UserRole = 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Patient';

/**
 * 1. Users Collection
 * Fields: uid, name, email, phone, role, status
 */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | string;
  department?: string;
  specialization?: string;
  createdAt?: string;
}

export type User = UserProfile;

/**
 * 2. Departments Collection
 * Fields: departmentId, departmentName, description, contactInformation, status
 */
export interface Department {
  departmentId: string;
  departmentName: string;
  description: string;
  contactInformation: string;
  status: 'Active' | 'Inactive' | string;
}

/**
 * 3. Patients Collection
 * Fields: patientId, name, dob, gender, phone, address, emergencyContact
 */
export interface Patient {
  patientId: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  phone: string;
  address: string;
  emergencyContact: string;
  email?: string;
  uid?: string;
  createdAt?: string;
}

export type PatientRecord = Patient;

/**
 * 4. Appointments Collection
 * Fields: appointmentId, patientId, doctorId, departmentId, date, time, reason, status
 */
export interface Appointment {
  appointmentId: string;
  id?: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled' | string;
  patientName?: string;
  doctorName?: string;
  tokenNumber?: string;
  createdAt?: string;
}

/**
 * 5. Admissions Collection
 * Fields: admissionId, patientId, doctorId, wardBed, admissionDate, reason, status
 */
export interface Admission {
  admissionId: string;
  id?: string;
  patientId: string;
  doctorId: string;
  wardBed: string;
  admissionDate: string;
  reason: string;
  status: 'Admitted' | 'Discharged' | 'Transferred' | 'Under Observation' | string;
  patientName?: string;
  doctorName?: string;
  dischargeDate?: string;
}

/**
 * 6. Medical Records Collection
 * Fields: recordId, patientId, doctorId, symptoms, diagnosis, treatment, clinicalNotes, date
 */
export interface MedicalRecord {
  recordId: string;
  id?: string;
  patientId: string;
  doctorId: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  clinicalNotes: string;
  date: string;
  patientName?: string;
  doctorName?: string;
  prescriptions?: string[];
  tests?: string[];
  notes?: string;
}

/**
 * 7. Prescriptions Collection
 * Fields: prescriptionId, patientId, doctorId, medicine, dosage, frequency, duration, instructions
 */
export interface Prescription {
  prescriptionId: string;
  id?: string;
  patientId: string;
  doctorId: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  patientName?: string;
  doctorName?: string;
  date?: string;
}

/**
 * 8. Vital Signs Collection
 * Fields: vitalRecordId, patientId, nurseId, temperature, pulse, bloodPressure, spO2, dateTime
 */
export interface VitalSigns {
  vitalRecordId: string;
  id?: string;
  patientId: string;
  nurseId: string;
  temperature: string;
  pulse: string;
  bloodPressure: string;
  spO2: string;
  dateTime: string;
  patientName?: string;
  nurseName?: string;
}

export type VitalRecord = VitalSigns;

/**
 * 9. Nursing Notes Collection
 * Fields: noteId, patientId, nurseId, observation, careProvided, note, dateTime
 */
export interface NursingNote {
  noteId: string;
  id?: string;
  patientId: string;
  nurseId: string;
  observation: string;
  careProvided: string;
  note: string;
  dateTime: string;
  patientName?: string;
  nurseName?: string;
}

/**
 * 10. Bills Collection
 * Fields: billId, patientId, services, amount, discount, total, paymentStatus, paymentDate
 */
export interface Bill {
  billId: string;
  id?: string;
  patientId: string;
  services: string;
  amount: number;
  discount: number;
  total: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial' | string;
  paymentDate: string;
  patientName?: string;
  paymentMethod?: string;
}

/**
 * 11. Chat & Consultation Messages Collection (`messages`)
 * Fields: messageId, senderId, senderName, senderRole, text, channel, createdAt, recipientId, patientId
 */
export interface ChatMessage {
  id?: string;
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  channel: 'general' | 'consultation' | 'nursing' | 'emergency' | string;
  createdAt: string;
  recipientId?: string;
  patientId?: string;
}
