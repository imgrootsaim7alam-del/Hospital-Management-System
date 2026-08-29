import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  UserProfile, 
  Department, 
  Patient, 
  Appointment, 
  Admission, 
  MedicalRecord, 
  Prescription, 
  VitalSigns, 
  NursingNote, 
  Bill, 
  ChatMessage,
  UserRole 
} from '../types';

/**
 * 1. USERS SERVICE (Collection: `users`)
 * Schema: uid, name, email, phone, role, status
 */
export const usersService = {
  async saveUserProfile(uid: string, profile: Partial<UserProfile>) {
    const userRef = doc(db, 'users', uid);
    const data: UserProfile = {
      uid,
      name: profile.name || 'User',
      email: profile.email || '',
      phone: profile.phone || '',
      role: profile.role || 'Patient',
      status: profile.status || 'Active',
      department: profile.department || '',
      specialization: profile.specialization || '',
      createdAt: profile.createdAt || new Date().toISOString(),
    };
    await setDoc(userRef, { ...data, timestamp: serverTimestamp() }, { merge: true });
    return data;
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    snap.forEach((d) => list.push(d.data() as UserProfile));
    return list;
  },

  async getUsersByRole(role?: UserRole): Promise<UserProfile[]> {
    const usersRef = collection(db, 'users');
    const q = role ? query(usersRef, where('role', '==', role)) : query(usersRef);
    const snap = await getDocs(q);
    const list: UserProfile[] = [];
    snap.forEach((d) => list.push(d.data() as UserProfile));
    return list;
  },

  subscribeUsers(callback: (users: UserProfile[]) => void) {
    return onSnapshot(collection(db, 'users'), (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((d) => list.push(d.data() as UserProfile));
      callback(list);
    });
  }
};

/**
 * 2. DEPARTMENTS SERVICE (Collection: `departments`)
 * Schema: departmentId, departmentName, description, contactInformation, status
 */
export const departmentsService = {
  async createDepartment(dept: Department) {
    const ref = doc(db, 'departments', dept.departmentId);
    await setDoc(ref, { ...dept, timestamp: serverTimestamp() }, { merge: true });
    return dept;
  },

  async getAllDepartments(): Promise<Department[]> {
    const snap = await getDocs(collection(db, 'departments'));
    const list: Department[] = [];
    snap.forEach((d) => list.push(d.data() as Department));
    return list;
  },

  async getDepartmentById(departmentId: string): Promise<Department | null> {
    const snap = await getDoc(doc(db, 'departments', departmentId));
    return snap.exists() ? (snap.data() as Department) : null;
  },

  subscribeDepartments(callback: (departments: Department[]) => void) {
    return onSnapshot(collection(db, 'departments'), (snap) => {
      const list: Department[] = [];
      snap.forEach((d) => list.push(d.data() as Department));
      callback(list);
    });
  }
};

/**
 * 3. PATIENTS SERVICE (Collection: `patients`)
 * Schema: patientId, name, dob, gender, phone, address, emergencyContact
 */
export const patientsService = {
  async createPatient(patient: Patient) {
    const pId = patient.patientId || `PAT-BD-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullPatient: Patient = {
      ...patient,
      patientId: pId,
      createdAt: patient.createdAt || new Date().toISOString(),
    };
    const ref = doc(db, 'patients', pId);
    await setDoc(ref, { ...fullPatient, timestamp: serverTimestamp() }, { merge: true });
    return fullPatient;
  },

  async getAllPatients(): Promise<Patient[]> {
    const snap = await getDocs(collection(db, 'patients'));
    const list: Patient[] = [];
    snap.forEach((d) => list.push(d.data() as Patient));
    return list;
  },

  async getPatientById(patientId: string): Promise<Patient | null> {
    const snap = await getDoc(doc(db, 'patients', patientId));
    return snap.exists() ? (snap.data() as Patient) : null;
  },

  subscribePatients(callback: (patients: Patient[]) => void) {
    return onSnapshot(collection(db, 'patients'), (snap) => {
      const list: Patient[] = [];
      snap.forEach((d) => list.push(d.data() as Patient));
      callback(list);
    });
  }
};

/**
 * 4. APPOINTMENTS SERVICE (Collection: `appointments`)
 * Schema: appointmentId, patientId, doctorId, departmentId, date, time, reason, status
 */
export const appointmentsService = {
  async createAppointment(appointment: Omit<Appointment, 'appointmentId'> & { appointmentId?: string }) {
    const apptId = appointment.appointmentId || `APT-${Date.now().toString().slice(-6)}`;
    const fullAppt: Appointment = {
      ...appointment,
      appointmentId: apptId,
      createdAt: new Date().toISOString(),
    };
    const ref = doc(db, 'appointments', apptId);
    await setDoc(ref, { ...fullAppt, timestamp: serverTimestamp() }, { merge: true });
    return fullAppt;
  },

  async getAllAppointments(): Promise<Appointment[]> {
    const snap = await getDocs(collection(db, 'appointments'));
    const list: Appointment[] = [];
    snap.forEach((d) => list.push(d.data() as Appointment));
    return list;
  },

  async getAppointmentsForDoctor(doctorId: string): Promise<Appointment[]> {
    const q = query(collection(db, 'appointments'), where('doctorId', '==', doctorId));
    const snap = await getDocs(q);
    const list: Appointment[] = [];
    snap.forEach((d) => list.push(d.data() as Appointment));
    return list;
  },

  async getAppointmentsForPatient(patientId: string): Promise<Appointment[]> {
    const q = query(collection(db, 'appointments'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    const list: Appointment[] = [];
    snap.forEach((d) => list.push(d.data() as Appointment));
    return list;
  },

  async updateAppointmentStatus(appointmentId: string, status: string) {
    const ref = doc(db, 'appointments', appointmentId);
    await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
  },

  subscribeAppointments(callback: (appointments: Appointment[]) => void) {
    return onSnapshot(collection(db, 'appointments'), (snap) => {
      const list: Appointment[] = [];
      snap.forEach((d) => list.push(d.data() as Appointment));
      callback(list);
    });
  }
};

/**
 * 5. ADMISSIONS SERVICE (Collection: `admissions`)
 * Schema: admissionId, patientId, doctorId, wardBed, admissionDate, reason, status
 */
export const admissionsService = {
  async createAdmission(admission: Omit<Admission, 'admissionId'> & { admissionId?: string }) {
    const admId = admission.admissionId || `ADM-${Date.now().toString().slice(-6)}`;
    const fullAdmission: Admission = {
      ...admission,
      admissionId: admId,
    };
    const ref = doc(db, 'admissions', admId);
    await setDoc(ref, { ...fullAdmission, timestamp: serverTimestamp() }, { merge: true });
    return fullAdmission;
  },

  async getAllAdmissions(): Promise<Admission[]> {
    const snap = await getDocs(collection(db, 'admissions'));
    const list: Admission[] = [];
    snap.forEach((d) => list.push(d.data() as Admission));
    return list;
  },

  async getAdmissionsForPatient(patientId: string): Promise<Admission[]> {
    const q = query(collection(db, 'admissions'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    const list: Admission[] = [];
    snap.forEach((d) => list.push(d.data() as Admission));
    return list;
  },

  async updateAdmissionStatus(admissionId: string, status: string) {
    const ref = doc(db, 'admissions', admissionId);
    await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
  },

  subscribeAdmissions(callback: (admissions: Admission[]) => void) {
    return onSnapshot(collection(db, 'admissions'), (snap) => {
      const list: Admission[] = [];
      snap.forEach((d) => list.push(d.data() as Admission));
      callback(list);
    });
  }
};

/**
 * 6. MEDICAL RECORDS SERVICE (Collection: `medical_records`)
 * Schema: recordId, patientId, doctorId, symptoms, diagnosis, treatment, clinicalNotes, date
 */
export const medicalRecordsService = {
  async addRecord(record: Omit<MedicalRecord, 'recordId'> & { recordId?: string }) {
    const recId = record.recordId || `REC-${Date.now().toString().slice(-6)}`;
    const fullRecord: MedicalRecord = {
      ...record,
      recordId: recId,
      date: record.date || new Date().toISOString().split('T')[0],
    };
    const ref = doc(db, 'medical_records', recId);
    await setDoc(ref, { ...fullRecord, timestamp: serverTimestamp() }, { merge: true });
    return fullRecord;
  },

  async getAllRecords(): Promise<MedicalRecord[]> {
    const snap = await getDocs(collection(db, 'medical_records'));
    const list: MedicalRecord[] = [];
    snap.forEach((d) => list.push(d.data() as MedicalRecord));
    return list;
  },

  async getRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    const q = query(collection(db, 'medical_records'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    const list: MedicalRecord[] = [];
    snap.forEach((d) => list.push(d.data() as MedicalRecord));
    return list;
  },

  subscribeMedicalRecords(callback: (records: MedicalRecord[]) => void) {
    return onSnapshot(collection(db, 'medical_records'), (snap) => {
      const list: MedicalRecord[] = [];
      snap.forEach((d) => list.push(d.data() as MedicalRecord));
      callback(list);
    });
  }
};

/**
 * 7. PRESCRIPTIONS SERVICE (Collection: `prescriptions`)
 * Schema: prescriptionId, patientId, doctorId, medicine, dosage, frequency, duration, instructions
 */
export const prescriptionsService = {
  async addPrescription(prescription: Omit<Prescription, 'prescriptionId'> & { prescriptionId?: string }) {
    const pId = prescription.prescriptionId || `RX-${Date.now().toString().slice(-6)}`;
    const fullPrescription: Prescription = {
      ...prescription,
      prescriptionId: pId,
      date: prescription.date || new Date().toISOString().split('T')[0],
    };
    const ref = doc(db, 'prescriptions', pId);
    await setDoc(ref, { ...fullPrescription, timestamp: serverTimestamp() }, { merge: true });
    return fullPrescription;
  },

  async getAllPrescriptions(): Promise<Prescription[]> {
    const snap = await getDocs(collection(db, 'prescriptions'));
    const list: Prescription[] = [];
    snap.forEach((d) => list.push(d.data() as Prescription));
    return list;
  },

  async getPrescriptionsForPatient(patientId: string): Promise<Prescription[]> {
    const q = query(collection(db, 'prescriptions'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    const list: Prescription[] = [];
    snap.forEach((d) => list.push(d.data() as Prescription));
    return list;
  },

  subscribePrescriptions(callback: (prescriptions: Prescription[]) => void) {
    return onSnapshot(collection(db, 'prescriptions'), (snap) => {
      const list: Prescription[] = [];
      snap.forEach((d) => list.push(d.data() as Prescription));
      callback(list);
    });
  }
};

/**
 * 8. VITAL SIGNS SERVICE (Collection: `vital_signs`)
 * Schema: vitalRecordId, patientId, nurseId, temperature, pulse, bloodPressure, spO2, dateTime
 */
export const vitalSignsService = {
  async recordVitals(vitals: Omit<VitalSigns, 'vitalRecordId'> & { vitalRecordId?: string }) {
    const vId = vitals.vitalRecordId || `VIT-${Date.now().toString().slice(-6)}`;
    const fullVitals: VitalSigns = {
      ...vitals,
      vitalRecordId: vId,
      dateTime: vitals.dateTime || new Date().toISOString(),
    };
    const ref = doc(db, 'vital_signs', vId);
    await setDoc(ref, { ...fullVitals, timestamp: serverTimestamp() }, { merge: true });
    return fullVitals;
  },

  async getAllVitals(): Promise<VitalSigns[]> {
    const snap = await getDocs(collection(db, 'vital_signs'));
    const list: VitalSigns[] = [];
    snap.forEach((d) => list.push(d.data() as VitalSigns));
    return list;
  },

  async getVitalsByPatient(patientId: string): Promise<VitalSigns[]> {
    const q = query(collection(db, 'vital_signs'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    const list: VitalSigns[] = [];
    snap.forEach((d) => list.push(d.data() as VitalSigns));
    return list;
  },

  subscribeVitals(callback: (vitals: VitalSigns[]) => void) {
    return onSnapshot(collection(db, 'vital_signs'), (snap) => {
      const list: VitalSigns[] = [];
      snap.forEach((d) => list.push(d.data() as VitalSigns));
      callback(list);
    });
  }
};

/**
 * 9. NURSING NOTES SERVICE (Collection: `nursing_notes`)
 * Schema: noteId, patientId, nurseId, observation, careProvided, note, dateTime
 */
export const nursingNotesService = {
  async addNote(noteData: Omit<NursingNote, 'noteId'> & { noteId?: string }) {
    const nId = noteData.noteId || `NOTE-${Date.now().toString().slice(-6)}`;
    const fullNote: NursingNote = {
      ...noteData,
      noteId: nId,
      dateTime: noteData.dateTime || new Date().toISOString(),
    };
    const ref = doc(db, 'nursing_notes', nId);
    await setDoc(ref, { ...fullNote, timestamp: serverTimestamp() }, { merge: true });
    return fullNote;
  },

  async getAllNotes(): Promise<NursingNote[]> {
    const snap = await getDocs(collection(db, 'nursing_notes'));
    const list: NursingNote[] = [];
    snap.forEach((d) => list.push(d.data() as NursingNote));
    return list;
  },

  async getNotesByPatient(patientId: string): Promise<NursingNote[]> {
    const q = query(collection(db, 'nursing_notes'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    const list: NursingNote[] = [];
    snap.forEach((d) => list.push(d.data() as NursingNote));
    return list;
  },

  subscribeNursingNotes(callback: (notes: NursingNote[]) => void) {
    return onSnapshot(collection(db, 'nursing_notes'), (snap) => {
      const list: NursingNote[] = [];
      snap.forEach((d) => list.push(d.data() as NursingNote));
      callback(list);
    });
  }
};

/**
 * 10. BILLS SERVICE (Collection: `bills`)
 * Schema: billId, patientId, services, amount, discount, total, paymentStatus, paymentDate
 */
export const billsService = {
  async createBill(bill: Omit<Bill, 'billId'> & { billId?: string }) {
    const bId = bill.billId || `INV-${Date.now().toString().slice(-6)}`;
    const fullBill: Bill = {
      ...bill,
      billId: bId,
      paymentDate: bill.paymentDate || new Date().toISOString().split('T')[0],
    };
    const ref = doc(db, 'bills', bId);
    await setDoc(ref, { ...fullBill, timestamp: serverTimestamp() }, { merge: true });
    return fullBill;
  },

  async getAllBills(): Promise<Bill[]> {
    const snap = await getDocs(collection(db, 'bills'));
    const list: Bill[] = [];
    snap.forEach((d) => list.push(d.data() as Bill));
    return list;
  },

  async getBillsForPatient(patientId: string): Promise<Bill[]> {
    const q = query(collection(db, 'bills'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    const list: Bill[] = [];
    snap.forEach((d) => list.push(d.data() as Bill));
    return list;
  },

  async updateBillPayment(billId: string, paymentStatus: Bill['paymentStatus']) {
    const ref = doc(db, 'bills', billId);
    await updateDoc(ref, { 
      paymentStatus, 
      paymentDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString() 
    });
  },

  subscribeBills(callback: (bills: Bill[]) => void) {
    return onSnapshot(collection(db, 'bills'), (snap) => {
      const list: Bill[] = [];
      snap.forEach((d) => list.push(d.data() as Bill));
      callback(list);
    });
  }
};

/**
 * 11. CHAT & MESSAGING SERVICE (Collection: `messages`)
 * Schema: messageId, senderId, senderName, senderRole, text, channel, createdAt, recipientId, patientId
 */
export const messagesService = {
  async sendMessage(msg: Omit<ChatMessage, 'messageId' | 'createdAt'> & { messageId?: string; createdAt?: string }) {
    const msgId = msg.messageId || `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const fullMsg: ChatMessage = {
      ...msg,
      messageId: msgId,
      createdAt: msg.createdAt || new Date().toISOString(),
    };
    const ref = doc(db, 'messages', msgId);
    await setDoc(ref, { ...fullMsg, timestamp: serverTimestamp() });
    return fullMsg;
  },

  async getAllMessages(): Promise<ChatMessage[]> {
    const snap = await getDocs(collection(db, 'messages'));
    const list: ChatMessage[] = [];
    snap.forEach((d) => list.push(d.data() as ChatMessage));
    // Sort in ascending order by createdAt
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async getMessagesByChannel(channel: string): Promise<ChatMessage[]> {
    const q = query(collection(db, 'messages'), where('channel', '==', channel));
    const snap = await getDocs(q);
    const list: ChatMessage[] = [];
    snap.forEach((d) => list.push(d.data() as ChatMessage));
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  subscribeMessages(channel: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(collection(db, 'messages'), where('channel', '==', channel));
    return onSnapshot(q, (snap) => {
      const list: ChatMessage[] = [];
      snap.forEach((d) => list.push(d.data() as ChatMessage));
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      callback(list);
    });
  },

  subscribeAllMessages(callback: (messages: ChatMessage[]) => void) {
    return onSnapshot(collection(db, 'messages'), (snap) => {
      const list: ChatMessage[] = [];
      snap.forEach((d) => list.push(d.data() as ChatMessage));
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      callback(list);
    });
  }
};

/**
 * Global Seeding Function to ensure initial documents for all collections in Cloud Firestore
 */
export async function seedAllCollectionsIfEmpty() {
  try {
    // 1. Departments
    const deptsSnap = await getDocs(collection(db, 'departments'));
    if (deptsSnap.empty) {
      const sampleDepts: Department[] = [
        {
          departmentId: 'DEPT-CARDIO',
          departmentName: 'Cardiology & Coronary Care',
          description: 'Comprehensive diagnosis and treatment of cardiac and cardiovascular disorders.',
          contactInformation: '+880 2 9887711 (Ext: 301)',
          status: 'Active'
        },
        {
          departmentId: 'DEPT-MEDICINE',
          departmentName: 'General & Internal Medicine',
          description: 'Primary medical care, diabetes, hypertension, and infectious diseases management.',
          contactInformation: '+880 2 9887711 (Ext: 201)',
          status: 'Active'
        },
        {
          departmentId: 'DEPT-ICU',
          departmentName: 'Intensive Care Unit (ICU & CCU)',
          description: '24/7 critical care monitoring with advanced ventilator and life support systems.',
          contactInformation: '+880 2 9887711 (Ext: 101)',
          status: 'Active'
        },
        {
          departmentId: 'DEPT-SURGERY',
          departmentName: 'General & Laparoscopic Surgery',
          description: 'Emergency trauma, minimally invasive laparoscopy, and elective surgical suites.',
          contactInformation: '+880 2 9887711 (Ext: 401)',
          status: 'Active'
        }
      ];
      for (const d of sampleDepts) {
        await departmentsService.createDepartment(d);
      }
    }

    // 2. Patients
    const patientsSnap = await getDocs(collection(db, 'patients'));
    if (patientsSnap.empty) {
      const samplePatients: Patient[] = [
        {
          patientId: 'PAT-BD-1001',
          name: 'Md. Jasim Uddin',
          dob: '1978-05-14',
          gender: 'Male',
          phone: '+880 1711-889922',
          address: 'House #24, Road #4, Sector 7, Uttara, Dhaka',
          emergencyContact: 'Ayesha Begum (Wife) - +880 1711-889923',
          email: 'jasim.uddin@gmail.com'
        },
        {
          patientId: 'PAT-BD-1002',
          name: 'Nusrat Jahan',
          dob: '1992-11-20',
          gender: 'Female',
          phone: '+880 1819-334455',
          address: 'Plot 12, Block C, Chawkbazar, Chattogram',
          emergencyContact: 'Farid Ahmed (Father) - +880 1819-334456',
          email: 'nusrat.jahan@gmail.com'
        },
        {
          patientId: 'PAT-BD-1003',
          name: 'Khandakar Mostafizur',
          dob: '1965-03-08',
          gender: 'Male',
          phone: '+880 1912-778899',
          address: '15/A Station Road, Boalia, Rajshahi',
          emergencyContact: 'Shakil Mostafiz (Son) - +880 1912-778890',
          email: 'k.mostafiz@gmail.com'
        }
      ];
      for (const p of samplePatients) {
        await patientsService.createPatient(p);
      }
    }

    // 3. Appointments
    const apptsSnap = await getDocs(collection(db, 'appointments'));
    if (apptsSnap.empty) {
      const sampleAppts: Omit<Appointment, 'appointmentId'>[] = [
        {
          patientId: 'PAT-BD-1001',
          doctorId: 'doc_1',
          departmentId: 'DEPT-CARDIO',
          date: '2026-08-28',
          time: '10:00 AM',
          reason: 'Hypertension follow-up and ECG evaluation',
          status: 'Scheduled',
          patientName: 'Md. Jasim Uddin',
          doctorName: 'Dr. Mosaddek Hossain',
          tokenNumber: 'Token #01'
        },
        {
          patientId: 'PAT-BD-1002',
          doctorId: 'doc_1',
          departmentId: 'DEPT-CARDIO',
          date: '2026-08-28',
          time: '10:30 AM',
          reason: 'Occasional chest tightness during physical exertion',
          status: 'Waiting',
          patientName: 'Nusrat Jahan',
          doctorName: 'Dr. Mosaddek Hossain',
          tokenNumber: 'Token #02'
        }
      ];
      for (const a of sampleAppts) {
        await appointmentsService.createAppointment(a);
      }
    }

    // 4. Admissions
    const admissionsSnap = await getDocs(collection(db, 'admissions'));
    if (admissionsSnap.empty) {
      const sampleAdmissions: Omit<Admission, 'admissionId'>[] = [
        {
          patientId: 'PAT-BD-1001',
          doctorId: 'doc_1',
          wardBed: 'Ward 4 - Bed 401 (Cardio Ward)',
          admissionDate: '2026-08-26 14:30',
          reason: 'Acute Coronary Syndrome post-stabilization observation',
          status: 'Admitted',
          patientName: 'Md. Jasim Uddin',
          doctorName: 'Dr. Mosaddek Hossain'
        },
        {
          patientId: 'PAT-BD-1003',
          doctorId: 'doc_1',
          wardBed: 'CCU - Bed 03 (Coronary Care)',
          admissionDate: '2026-08-25 09:00',
          reason: 'Severe decompensated cardiac failure',
          status: 'Under Observation',
          patientName: 'Khandakar Mostafizur',
          doctorName: 'Dr. Mosaddek Hossain'
        }
      ];
      for (const adm of sampleAdmissions) {
        await admissionsService.createAdmission(adm);
      }
    }

    // 5. Medical Records
    const medRecsSnap = await getDocs(collection(db, 'medical_records'));
    if (medRecsSnap.empty) {
      const sampleRecords: Omit<MedicalRecord, 'recordId'>[] = [
        {
          patientId: 'PAT-BD-1001',
          doctorId: 'doc_1',
          symptoms: 'Exertional dyspnea, elevated blood pressure (150/95 mmHg), fatigue',
          diagnosis: 'Essential Stage 2 Hypertension with mild angina',
          treatment: 'Antihypertensive therapy, dietary sodium restriction, lifestyle modifications',
          clinicalNotes: 'Patient advised to monitor home BP daily. Routine 12-lead ECG showed sinus rhythm with LVH criteria.',
          date: '2026-08-26',
          patientName: 'Md. Jasim Uddin',
          doctorName: 'Dr. Mosaddek Hossain'
        }
      ];
      for (const rec of sampleRecords) {
        await medicalRecordsService.addRecord(rec);
      }
    }

    // 6. Prescriptions
    const rxSnap = await getDocs(collection(db, 'prescriptions'));
    if (rxSnap.empty) {
      const samplePrescriptions: Omit<Prescription, 'prescriptionId'>[] = [
        {
          patientId: 'PAT-BD-1001',
          doctorId: 'doc_1',
          medicine: 'Tab. Telmisartan (Telma 40mg)',
          dosage: '40mg',
          frequency: '1-0-0 (Morning)',
          duration: '30 Days',
          instructions: 'Take 30 minutes after breakfast with water',
          patientName: 'Md. Jasim Uddin',
          doctorName: 'Dr. Mosaddek Hossain'
        },
        {
          patientId: 'PAT-BD-1001',
          doctorId: 'doc_1',
          medicine: 'Tab. Rosuvastatin (Rasuva 10mg)',
          dosage: '10mg',
          frequency: '0-0-1 (Night)',
          duration: '30 Days',
          instructions: 'Take at bedtime after dinner',
          patientName: 'Md. Jasim Uddin',
          doctorName: 'Dr. Mosaddek Hossain'
        }
      ];
      for (const rx of samplePrescriptions) {
        await prescriptionsService.addPrescription(rx);
      }
    }

    // 7. Vital Signs
    const vitalsSnap = await getDocs(collection(db, 'vital_signs'));
    if (vitalsSnap.empty) {
      const sampleVitals: Omit<VitalSigns, 'vitalRecordId'>[] = [
        {
          patientId: 'PAT-BD-1001',
          nurseId: 'nurse_1',
          temperature: '98.6°F',
          pulse: '72 bpm',
          bloodPressure: '120/80 mmHg',
          spO2: '99%',
          dateTime: '2026-08-27 08:30:00',
          patientName: 'Md. Jasim Uddin',
          nurseName: 'Nurse Sadia Islam'
        },
        {
          patientId: 'PAT-BD-1003',
          nurseId: 'nurse_1',
          temperature: '99.1°F',
          pulse: '84 bpm',
          bloodPressure: '135/88 mmHg',
          spO2: '97%',
          dateTime: '2026-08-27 09:15:00',
          patientName: 'Khandakar Mostafizur',
          nurseName: 'Nurse Sadia Islam'
        }
      ];
      for (const v of sampleVitals) {
        await vitalSignsService.recordVitals(v);
      }
    }

    // 8. Nursing Notes
    const notesSnap = await getDocs(collection(db, 'nursing_notes'));
    if (notesSnap.empty) {
      const sampleNotes: Omit<NursingNote, 'noteId'>[] = [
        {
          patientId: 'PAT-BD-1001',
          nurseId: 'nurse_1',
          observation: 'Patient is conscious, oriented, resting comfortably in bed. No active chest discomfort.',
          careProvided: 'Administered morning oral antihypertensive medicines. IV cannula line flushed and patent.',
          note: 'Vitals stable. Continuing standard CCU cardiac protocol.',
          dateTime: '2026-08-27 09:00:00',
          patientName: 'Md. Jasim Uddin',
          nurseName: 'Nurse Sadia Islam'
        }
      ];
      for (const n of sampleNotes) {
        await nursingNotesService.addNote(n);
      }
    }

    // 9. Bills
    const billsSnap = await getDocs(collection(db, 'bills'));
    if (billsSnap.empty) {
      const sampleBills: Omit<Bill, 'billId'>[] = [
        {
          patientId: 'PAT-BD-1001',
          services: 'OPD Specialist Consultation + 12-Lead ECG + Serum Lipid Profile',
          amount: 2500,
          discount: 250,
          total: 2250,
          paymentStatus: 'Paid',
          paymentDate: '2026-08-27',
          patientName: 'Md. Jasim Uddin',
          paymentMethod: 'bKash Merchant Payment'
        },
        {
          patientId: 'PAT-BD-1003',
          services: 'CCU Ward Admission (2 Days) + Vital Monitoring + Medication',
          amount: 8500,
          discount: 500,
          total: 8000,
          paymentStatus: 'Pending',
          paymentDate: '2026-08-28',
          patientName: 'Khandakar Mostafizur',
          paymentMethod: 'Cash Counter'
        }
      ];
      for (const b of sampleBills) {
        await billsService.createBill(b);
      }
    }

    // 10. Messages & Chat
    const msgsSnap = await getDocs(collection(db, 'messages'));
    if (msgsSnap.empty) {
      const sampleMessages: Omit<ChatMessage, 'messageId' | 'createdAt'>[] = [
        {
          senderId: 'bd-doctor-02',
          senderName: 'Dr. Mosaddek Hossain, MBBS, FCPS',
          senderRole: 'Doctor',
          text: 'Good morning team. Please ensure Bed 401 morning ECG report is uploaded before 11 AM.',
          channel: 'general',
        },
        {
          senderId: 'bd-nurse-03',
          senderName: 'Senior Nurse Rabeya Khatun',
          senderRole: 'Nurse',
          text: 'Noted Doctor. Vitals for Bed 401 are stable (BP: 120/80, SpO2: 99%). ECG trace has been completed.',
          channel: 'general',
        },
        {
          senderId: 'bd-reception-04',
          senderName: 'Tanvir Ahmed',
          senderRole: 'Receptionist',
          text: 'OPD Token queue is open. 18 patients booked for cardiology chamber today.',
          channel: 'general',
        },
        {
          senderId: 'bd-patient-05',
          senderName: 'Mohammad Kamrul Hasan',
          senderRole: 'Patient',
          text: 'Hello doctor, do I need to remain fasting before my lipid profile test tomorrow?',
          channel: 'consultation',
        },
        {
          senderId: 'bd-doctor-02',
          senderName: 'Dr. Mosaddek Hossain, MBBS, FCPS',
          senderRole: 'Doctor',
          text: 'Yes Mr. Kamrul, please maintain 10-12 hours overnight fasting before giving blood samples.',
          channel: 'consultation',
        }
      ];
      for (const m of sampleMessages) {
        await messagesService.sendMessage(m);
      }
    }
  } catch (err) {
    console.warn('Firestore collections initialization notice:', err);
  }
}
