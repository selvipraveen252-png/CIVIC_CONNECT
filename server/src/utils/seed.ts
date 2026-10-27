import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Department from '../models/Department';
import Issue from '../models/Issue';
import Notification from '../models/Notification';
import { connectDB, closeDB } from '../config/db';

export const seedDatabase = async () => {
  console.log('[Seed] Starting database seeding process...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Issue.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('[Seed] Cleared existing data.');

  // 1. Create Departments
  const departmentsData = [
    {
      name: 'Public Works Department (PWD)',
      description: 'Responsible for road maintenance, pothole patching, bridges, and public civic infrastructure.',
      contactEmail: 'pwd-support@civicconnect.gov',
      contactPhone: '+1 (555) 234-5671',
    },
    {
      name: 'Water Supply & Sewerage Board',
      description: 'Manages municipal drinking water distribution, pipe burst repairs, and sewage systems.',
      contactEmail: 'water-board@civicconnect.gov',
      contactPhone: '+1 (555) 234-5672',
    },
    {
      name: 'Solid Waste Management Division',
      description: 'Handles municipal garbage clearance, waste collection dumpsters, and neighborhood sanitation.',
      contactEmail: 'sanitation@civicconnect.gov',
      contactPhone: '+1 (555) 234-5673',
    },
    {
      name: 'Electricity & Street Lighting Department',
      description: 'Oversees public lighting, streetlight repair, faulty transformers, and electrical safety.',
      contactEmail: 'streetlights@civicconnect.gov',
      contactPhone: '+1 (555) 234-5674',
    },
    {
      name: 'Traffic Engineering & Transit Authority',
      description: 'Maintains traffic signals, regulatory signage, pedestrian crossings, and intersection safety.',
      contactEmail: 'traffic@civicconnect.gov',
      contactPhone: '+1 (555) 234-5675',
    },
    {
      name: 'Stormwater & Drainage Maintenance',
      description: 'Maintains open storm drains, culverts, monsoon desilting, and prevents urban flooding.',
      contactEmail: 'drainage@civicconnect.gov',
      contactPhone: '+1 (555) 234-5676',
    },
  ];

  const createdDepartments = await Department.insertMany(departmentsData);
  console.log(`[Seed] Created ${createdDepartments.length} municipal departments.`);

  const [pwdDept, waterDept, wasteDept, elecDept, trafficDept, drainDept] = createdDepartments;

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('Admin@123', salt);
  const officerHash = await bcrypt.hash('Officer@123', salt);
  const citizenHash = await bcrypt.hash('Citizen@123', salt);

  const usersData = [
    {
      name: 'Admin Director',
      email: 'admin@civicconnect.com',
      password: adminHash,
      role: 'admin',
      phone: '+1 (555) 100-0001',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Officer Rajesh Kumar',
      email: 'officer@civicconnect.com',
      password: officerHash,
      role: 'officer',
      department: pwdDept._id,
      phone: '+1 (555) 200-0002',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Officer Priya Sharma',
      email: 'water.officer@civicconnect.com',
      password: officerHash,
      role: 'officer',
      department: waterDept._id,
      phone: '+1 (555) 200-0003',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Officer Marcus Vance',
      email: 'sanitation.officer@civicconnect.com',
      password: officerHash,
      role: 'officer',
      department: wasteDept._id,
      phone: '+1 (555) 200-0004',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Citizen Praveen Kumar',
      email: 'citizen@civicconnect.com',
      password: citizenHash,
      role: 'citizen',
      phone: '+1 (555) 300-0001',
      profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Jane Doe',
      email: 'jane.citizen@civicconnect.com',
      password: citizenHash,
      role: 'citizen',
      phone: '+1 (555) 300-0002',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Robert Jenkins',
      email: 'robert.citizen@civicconnect.com',
      password: citizenHash,
      role: 'citizen',
      phone: '+1 (555) 300-0003',
      profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    },
  ];

  // Note: we bypass pre-save hash because passwords are pre-hashed here
  const createdUsers = await User.collection.insertMany(
    usersData.map((u) => ({
      ...u,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  console.log(`[Seed] Created ${Object.keys(createdUsers.insertedIds).length} system users.`);

  const adminUser = await User.findOne({ email: 'admin@civicconnect.com' });
  const pwdOfficer = await User.findOne({ email: 'officer@civicconnect.com' });
  const waterOfficer = await User.findOne({ email: 'water.officer@civicconnect.com' });
  const citizenUser = await User.findOne({ email: 'citizen@civicconnect.com' });
  const janeCitizen = await User.findOne({ email: 'jane.citizen@civicconnect.com' });

  // 3. Create at least 18 realistic sample issues across categories, statuses, priorities, and GIS coords
  // Realistic geographic cluster centered around metro coordinates (Latitude ~ 12.9716, Longitude ~ 77.5946)
  const sampleIssues = [
    {
      title: 'Deep Hazardous Pothole near Main Avenue Intersection',
      description: 'A deep crater-like pothole has opened up following overnight rains. Multiple two-wheelers have skidded and suffered damage. Requires immediate asphalt patching.',
      category: 'Pothole',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      address: 'Plot 42, Main Avenue, 4th Cross, City Center',
      reportedBy: citizenUser!._id,
      assignedDepartment: pwdDept._id,
      assignedOfficer: pwdOfficer!._id,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 4 * 86400000),
          remarks: 'Citizen reported hazardous road crater after rainstorm.',
        },
        {
          status: 'VERIFIED',
          changedBy: pwdOfficer!._id,
          changedAt: new Date(Date.now() - 3 * 86400000),
          remarks: 'Inspected by field team. High safety hazard confirmed.',
        },
        {
          status: 'ASSIGNED',
          changedBy: adminUser!._id,
          changedAt: new Date(Date.now() - 2 * 86400000),
          remarks: 'Assigned to road maintenance dispatch crew A-4.',
        },
        {
          status: 'IN_PROGRESS',
          changedBy: pwdOfficer!._id,
          changedAt: new Date(Date.now() - 1 * 86400000),
          remarks: 'Cold-mix asphalt patch truck dispatched on site.',
        },
      ],
    },
    {
      title: 'Severe Drinking Water Pipeline Burst Flooding Street',
      description: 'Major underground pipeline ruptured near the bus shelter. Gallons of clean drinking water spilling into the roadway and entering basement parking lots.',
      category: 'Water Leakage',
      priority: 'CRITICAL',
      status: 'VERIFIED',
      image: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.6033, 12.9784] },
      address: 'Near Central Bus Shelter, MG Road Junction',
      reportedBy: citizenUser!._id,
      assignedDepartment: waterDept._id,
      assignedOfficer: waterOfficer!._id,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 2 * 86400000),
          remarks: 'High pressure water leak visible on roadway.',
        },
        {
          status: 'VERIFIED',
          changedBy: waterOfficer!._id,
          changedAt: new Date(Date.now() - 1 * 86400000),
          remarks: 'Verified 8-inch main valve pressure failure. Valve isolation scheduled.',
        },
      ],
    },
    {
      title: 'Overflowing Community Waste Dumpster Spilling into Sidewalk',
      description: 'The municipal dumpster has not been cleared for over four days. Piles of unsegregated organic waste rotting in open air, attracting stray animals and pests.',
      category: 'Garbage Overflow',
      priority: 'HIGH',
      status: 'ASSIGNED',
      image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.5855, 12.9642] },
      address: 'Corner of 7th Main & 2nd Block, Residential Sector',
      reportedBy: janeCitizen!._id,
      assignedDepartment: wasteDept._id,
      assignedOfficer: null,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: janeCitizen!._id,
          changedAt: new Date(Date.now() - 3 * 86400000),
          remarks: 'Garbage bins completely filled and overflowing onto sidewalk.',
        },
        {
          status: 'ASSIGNED',
          changedBy: adminUser!._id,
          changedAt: new Date(Date.now() - 1 * 86400000),
          remarks: 'Assigned to Solid Waste compacting fleet unit #12.',
        },
      ],
    },
    {
      title: 'Series of 5 Broken Streetlights Causing Pitch Black Zone',
      description: 'Continuous stretch of streetlights from pillar #44 to #49 are inactive. Pedestrians and night-shift workers feel unsafe walking in this corridor.',
      category: 'Streetlight Failure',
      priority: 'MEDIUM',
      status: 'REPORTED',
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.6152, 12.9821] },
      address: 'Outer Ring Corridor, Opposite Tech Park Gate 2',
      reportedBy: citizenUser!._id,
      assignedDepartment: elecDept._id,
      assignedOfficer: null,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 1 * 86400000),
          remarks: 'Newly reported by citizen via mobile GPS.',
        },
      ],
    },
    {
      title: 'Clogged Stormwater Drain Causing Waterlogging During Drizzle',
      description: 'Heavy silt and plastic debris have plugged the stormwater inlet grate. Water backs up immediately and floods the pedestrian footpath.',
      category: 'Drainage Problem',
      priority: 'HIGH',
      status: 'RESOLVED',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.5741, 12.9553] },
      address: 'Near Old Market Gate, Ward 28 Drainage Culvert',
      reportedBy: citizenUser!._id,
      assignedDepartment: drainDept._id,
      assignedOfficer: pwdOfficer!._id,
      resolvedAt: new Date(Date.now() - 12 * 3600000),
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 5 * 86400000),
          remarks: 'Footpath flooded due to blocked drainage.',
        },
        {
          status: 'VERIFIED',
          changedBy: pwdOfficer!._id,
          changedAt: new Date(Date.now() - 4 * 86400000),
          remarks: 'Grate blocked by building construction debris.',
        },
        {
          status: 'IN_PROGRESS',
          changedBy: pwdOfficer!._id,
          changedAt: new Date(Date.now() - 2 * 86400000),
          remarks: 'Desilting machine operated by drain maintenance crew.',
        },
        {
          status: 'RESOLVED',
          changedBy: pwdOfficer!._id,
          changedAt: new Date(Date.now() - 12 * 3600000),
          remarks: 'Drain thoroughly desilted. Inlet flow rate tested and cleared.',
          evidenceImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      title: 'Knocked Down Stop Sign & Broken Traffic Signal Sensor',
      description: 'A commercial delivery truck struck the intersection stop sign and severed the loop detector cable yesterday evening. Traffic flow is chaotic.',
      category: 'Traffic Problem',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.6219, 12.9691] },
      address: 'B-Block 5th Cross & Service Road Junction',
      reportedBy: janeCitizen!._id,
      assignedDepartment: trafficDept._id,
      assignedOfficer: pwdOfficer!._id,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: janeCitizen!._id,
          changedAt: new Date(Date.now() - 3 * 86400000),
          remarks: 'Signboard broken and lying on edge of road.',
        },
        {
          status: 'ASSIGNED',
          changedBy: adminUser!._id,
          changedAt: new Date(Date.now() - 2 * 86400000),
          remarks: 'Traffic crew dispatched to replace post.',
        },
        {
          status: 'IN_PROGRESS',
          changedBy: pwdOfficer!._id,
          changedAt: new Date(Date.now() - 1 * 86400000),
          remarks: 'New reflective sign board mounted; rewiring signal detector.',
        },
      ],
    },
    {
      title: 'Collapsed Concrete Slabs on Public Footpath',
      description: 'Three heavy pavers over the service utility trench collapsed under pedestrian load. Concrete shards expose a 4-foot deep chamber beneath.',
      category: 'Public Infrastructure',
      priority: 'CRITICAL',
      status: 'VERIFIED',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.5898, 12.9882] },
      address: 'North Pavilion Avenue, Beside Public Library',
      reportedBy: citizenUser!._id,
      assignedDepartment: pwdDept._id,
      assignedOfficer: pwdOfficer!._id,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 2 * 86400000),
          remarks: 'Dangerous exposed chamber on busy library footpath.',
        },
        {
          status: 'VERIFIED',
          changedBy: pwdOfficer!._id,
          changedAt: new Date(Date.now() - 1 * 86400000),
          remarks: 'Barricaded zone with warning tape; reinforced concrete slab ordered.',
        },
      ],
    },
    {
      title: 'Illegal Commercial Debris Dumping on Open Plot',
      description: 'Demolition waste and broken plaster dumped along the roadway perimeter. Impeding traffic visibility at curve.',
      category: 'Garbage Overflow',
      priority: 'MEDIUM',
      status: 'CLOSED',
      image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.6341, 12.9615] },
      address: 'Survey No 81, Green Valley Layout Bypass',
      reportedBy: citizenUser!._id,
      assignedDepartment: wasteDept._id,
      assignedOfficer: pwdOfficer!._id,
      resolvedAt: new Date(Date.now() - 3 * 86400000),
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 6 * 86400000),
          remarks: 'Large pile of concrete rubble dumped on road curve.',
        },
        {
          status: 'RESOLVED',
          changedBy: pwdOfficer!._id,
          changedAt: new Date(Date.now() - 3 * 86400000),
          remarks: 'Municipal JCB loader removed debris. Area sanitized.',
        },
        {
          status: 'CLOSED',
          changedBy: adminUser!._id,
          changedAt: new Date(Date.now() - 2 * 86400000),
          remarks: 'Citizen confirmed resolution quality. Ticket closed.',
        },
      ],
    },
    {
      title: 'Pothole Reopened Due to Incomplete Patching',
      description: 'Pothole previously filled with loose gravel washed away in light rain. Asphalt did not bind properly and road is cratered again.',
      category: 'Pothole',
      priority: 'HIGH',
      status: 'REOPENED',
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.5684, 12.9739] },
      address: '2nd Cross, Vivekananda Road, Malleshwaram',
      reportedBy: citizenUser!._id,
      assignedDepartment: pwdDept._id,
      assignedOfficer: pwdOfficer!._id,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 7 * 86400000),
          remarks: 'Pothole reported.',
        },
        {
          status: 'RESOLVED',
          changedBy: pwdOfficer!._id,
          changedAt: new Date(Date.now() - 3 * 86400000),
          remarks: 'Temporary gravel mix applied.',
        },
        {
          status: 'REOPENED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 1 * 86400000),
          remarks: 'Gravel washed away in rain within 2 days. Permanent bitumen paving needed.',
        },
      ],
    },
    {
      title: 'Invalid / Spam Report for Private Driveway',
      description: 'Report requested municipal repaving of private garage driveway inside a gated private villa compound.',
      category: 'Road Damage',
      priority: 'LOW',
      status: 'REJECTED',
      image: '',
      location: { type: 'Point', coordinates: [77.6401, 12.9799] },
      address: 'Villa 14, Palm Grove Luxury Enclave',
      reportedBy: janeCitizen!._id,
      assignedDepartment: pwdDept._id,
      assignedOfficer: pwdOfficer!._id,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: janeCitizen!._id,
          changedAt: new Date(Date.now() - 4 * 86400000),
          remarks: 'Requested driveway paving.',
        },
        {
          status: 'REJECTED',
          changedBy: pwdOfficer!._id,
          changedAt: new Date(Date.now() - 3 * 86400000),
          remarks: 'Municipal resources only apply to public streets and thoroughfares. Private property rejected.',
        },
      ],
    },
    {
      title: 'Sewage Backflow from Manhole into Commercial Plaza Walkway',
      description: 'Greywater and effluent spilling from unsealed manhole collar. Foul odor and sanitary risk for shoppers and local businesses.',
      category: 'Drainage Problem',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.6095, 12.9512] },
      address: 'Brigade Link Promenade, Near Metro Exit C',
      reportedBy: citizenUser!._id,
      assignedDepartment: waterDept._id,
      assignedOfficer: waterOfficer!._id,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 2 * 86400000),
          remarks: 'Manhole overflowing onto public tiles.',
        },
        {
          status: 'IN_PROGRESS',
          changedBy: waterOfficer!._id,
          changedAt: new Date(Date.now() - 6 * 3600000),
          remarks: 'Suction jetting truck on site to clear downstream blockage.',
        },
      ],
    },
    {
      title: 'Flickering High-Mast Light at Busy Highway Flyover Ramp',
      description: 'The high-mast lighting pole flashes erratically every 3 seconds, creating severe glare and disorientation for nighttime motorists entering flyover.',
      category: 'Streetlight Failure',
      priority: 'HIGH',
      status: 'VERIFIED',
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.6251, 12.9914] },
      address: 'Flyover Entry Ramp 3, Hebbal Outer Circle',
      reportedBy: citizenUser!._id,
      assignedDepartment: elecDept._id,
      assignedOfficer: null,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 2 * 86400000),
          remarks: 'Severe glare from strobe-like streetlight malfunction.',
        },
        {
          status: 'VERIFIED',
          changedBy: adminUser!._id,
          changedAt: new Date(Date.now() - 1 * 86400000),
          remarks: 'Ballast capacitor blown. High priority replacement needed.',
        },
      ],
    },
    {
      title: 'Collapsed Guard Rail on Canal Bridge Road',
      description: 'Corroded metal safety railing broke away leaving a 15-foot unprotected drop into the drainage canal. High danger for school children.',
      category: 'Public Infrastructure',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.5812, 12.9421] },
      address: 'Canal Crossing Road, Ward 14 Boundary',
      reportedBy: citizenUser!._id,
      assignedDepartment: pwdDept._id,
      assignedOfficer: pwdOfficer!._id,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 3 * 86400000),
          remarks: 'Railing missing over deep drop.',
        },
        {
          status: 'ASSIGNED',
          changedBy: adminUser!._id,
          changedAt: new Date(Date.now() - 1 * 86400000),
          remarks: 'Assigned to structural fabrications team for safety barrier welding.',
        },
      ],
    },
    {
      title: 'E-Waste & Batteries Dumped in Community Park Garden',
      description: 'Discarded electronics, cracked laptop monitors and lead batteries left near the children play zone. Hazardous toxic risk.',
      category: 'Garbage Overflow',
      priority: 'HIGH',
      status: 'REPORTED',
      image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.5991, 12.9678] },
      address: 'Silver Oaks Community Park, South Perimeter',
      reportedBy: citizenUser!._id,
      assignedDepartment: wasteDept._id,
      assignedOfficer: null,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 12 * 3600000),
          remarks: 'Toxic chemical e-waste reported in public park.',
        },
      ],
    },
    {
      title: 'Obscured Speed Limit & School Zone Signs Covered by Wild Overgrowth',
      description: 'Thick banyan tree foliage has completely enveloped the school zone 20 km/h speed signs. Vehicles speed through crosswalk unnoticed.',
      category: 'Traffic Problem',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.6188, 12.9567] },
      address: 'Opposite St. Jude High School, 10th Main',
      reportedBy: janeCitizen!._id,
      assignedDepartment: trafficDept._id,
      assignedOfficer: pwdOfficer!._id,
      resolvedAt: new Date(Date.now() - 18 * 3600000),
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: janeCitizen!._id,
          changedAt: new Date(Date.now() - 4 * 86400000),
          remarks: 'Signage invisible to approaching traffic.',
        },
        {
          status: 'RESOLVED',
          changedBy: pwdOfficer!._id,
          changedAt: new Date(Date.now() - 18 * 3600000),
          remarks: 'Horticulture & road safety crew trimmed foliage; sign fully visible.',
        },
      ],
    },
    {
      title: 'Leaking Public Water Tap Flooding Bus Terminus Platform',
      description: 'Public drinking fountain valve mechanism is broken, running continuously at full pressure for 48 hours.',
      category: 'Water Leakage',
      priority: 'MEDIUM',
      status: 'REPORTED',
      image: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.5872, 12.9819] },
      address: 'City Central Bus Terminus, Platform Bay 4',
      reportedBy: citizenUser!._id,
      assignedDepartment: waterDept._id,
      assignedOfficer: null,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 8 * 3600000),
          remarks: 'Continuous clean water wastage reported.',
        },
      ],
    },
    {
      title: 'Damaged Speed Breaker with Exposed Steel Reinforcement Rebar',
      description: 'Concrete speed hump eroded, exposing razor-sharp rusted iron rebar that punctures car and motorcycle tires.',
      category: 'Road Damage',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      location: { type: 'Point', coordinates: [77.6111, 12.9733] },
      address: 'Hospital Road, 200m before Emergency Ward Entrance',
      reportedBy: citizenUser!._id,
      assignedDepartment: pwdDept._id,
      assignedOfficer: pwdOfficer!._id,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: citizenUser!._id,
          changedAt: new Date(Date.now() - 2 * 86400000),
          remarks: 'Sharp steel rod puncturing tires on hospital approach.',
        },
        {
          status: 'ASSIGNED',
          changedBy: adminUser!._id,
          changedAt: new Date(Date.now() - 1 * 86400000),
          remarks: 'Assigned to emergency road repair crew to grind rebar and repave hump.',
        },
      ],
    },
  ];

  const createdIssues = await Issue.insertMany(sampleIssues);
  console.log(`[Seed] Created ${createdIssues.length} realistic sample issues.`);

  // 4. Create sample notifications for users
  const notificationsData = [
    {
      user: citizenUser!._id,
      issue: createdIssues[0]._id,
      message: 'Status update: Pothole report near Main Avenue has been set to IN_PROGRESS.',
      read: false,
      createdAt: new Date(Date.now() - 2 * 3600000),
    },
    {
      user: citizenUser!._id,
      issue: createdIssues[4]._id,
      message: 'Resolution confirmed: Clogged Stormwater Drain report has been marked RESOLVED.',
      read: true,
      createdAt: new Date(Date.now() - 12 * 3600000),
    },
    {
      user: pwdOfficer!._id,
      issue: createdIssues[0]._id,
      message: 'New assignment: You have been assigned as lead officer for Pothole #42.',
      read: false,
      createdAt: new Date(Date.now() - 24 * 3600000),
    },
    {
      user: adminUser!._id,
      issue: createdIssues[1]._id,
      message: 'Critical Issue Alert: Severe Drinking Water Pipeline Burst requires urgent attention.',
      read: false,
      createdAt: new Date(Date.now() - 4 * 3600000),
    },
  ];

  await Notification.insertMany(notificationsData);
  console.log('[Seed] Created sample notifications.');

  console.log('[Seed] Seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('DEMO CREDENTIALS:');
  console.log('Admin:   admin@civicconnect.com   / Admin@123');
  console.log('Officer: officer@civicconnect.com / Officer@123');
  console.log('Citizen: citizen@civicconnect.com / Citizen@123');
  console.log('----------------------------------------------------');
};

// If run directly via npm run seed
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    }
  })();
}

export default seedDatabase;
