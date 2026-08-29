import { UserProfile, UserRole } from '../types';

export interface DemoAccount {
  role: UserRole;
  label: string;
  email: string;
  password: string;
  profile: UserProfile;
  color: string;
  badge: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Admin',
    label: 'Hospital Admin',
    email: 'admin@dhaka-med.com.bd',
    password: 'password123',
    color: 'border-rose-500/20 bg-rose-50/50 text-rose-700',
    badge: 'System Administrator',
    profile: {
      uid: 'bd-admin-01',
      name: 'Prof. Dr. Rafiqul Islam',
      email: 'admin@dhaka-med.com.bd',
      phone: '+880 1711-001122',
      role: 'Admin',
      status: 'Active',
      department: 'Hospital Governance & Operations',
    },
  },
  {
    role: 'Doctor',
    label: 'Specialist Physician',
    email: 'doctor@dhaka-med.com.bd',
    password: 'password123',
    color: 'border-sky-500/20 bg-sky-50/50 text-sky-700',
    badge: 'Cardiology Specialist (BMDC Reg: A-45210)',
    profile: {
      uid: 'bd-doctor-02',
      name: 'Dr. Mosaddek Hossain, MBBS, FCPS',
      email: 'doctor@dhaka-med.com.bd',
      phone: '+880 1819-234567',
      role: 'Doctor',
      status: 'Active',
      department: 'Department of Cardiology & Internal Medicine',
      specialization: 'BMDC: A-45210 • Chief Consultant',
    },
  },
  {
    role: 'Nurse',
    label: 'Senior Staff Nurse',
    email: 'nurse@dhaka-med.com.bd',
    password: 'password123',
    color: 'border-emerald-500/20 bg-emerald-50/50 text-emerald-700',
    badge: 'In-Patient Ward & CCU Charge',
    profile: {
      uid: 'bd-nurse-03',
      name: 'Senior Nurse Rabeya Khatun',
      email: 'nurse@dhaka-med.com.bd',
      phone: '+880 1912-345678',
      role: 'Nurse',
      status: 'Active',
      department: 'Coronary Care Unit (CCU) & Ward 3',
    },
  },
  {
    role: 'Receptionist',
    label: 'Front Desk Receptionist',
    email: 'receptionist@dhaka-med.com.bd',
    password: 'password123',
    color: 'border-amber-500/20 bg-amber-50/50 text-amber-700',
    badge: 'Patient Intake & Token Counter',
    profile: {
      uid: 'bd-reception-04',
      name: 'Tanvir Ahmed',
      email: 'receptionist@dhaka-med.com.bd',
      phone: '+880 1611-987654',
      role: 'Receptionist',
      status: 'Active',
      department: 'Main OPD Admissions Desk #1',
    },
  },
  {
    role: 'Patient',
    label: 'Registered Patient',
    email: 'patient@dhaka-med.com.bd',
    password: 'password123',
    color: 'border-indigo-500/20 bg-indigo-50/50 text-indigo-700',
    badge: 'Patient ID: PAT-BD-9821',
    profile: {
      uid: 'bd-patient-05',
      name: 'Mohammad Kamrul Hasan',
      email: 'patient@dhaka-med.com.bd',
      phone: '+880 1722-334455',
      role: 'Patient',
      status: 'Active',
    },
  },
];
