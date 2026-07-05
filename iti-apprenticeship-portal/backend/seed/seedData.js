// Populates the database with realistic sample data so reviewers see a
// working portal instead of empty tables. Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

const run = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([User.deleteMany({}), Job.deleteMany({}), Application.deleteMany({})]);

  console.log("Creating admin account...");
  const admin = await User.create({
    name: "Portal Admin",
    email: "admin@itiportal.in",
    password: "Admin@12345",
    role: "admin",
    phone: "9800000000",
    location: "Pune, Maharashtra",
  });

  console.log("Creating employer accounts...");
  const employers = await User.create([
    {
      name: "Rajesh Kulkarni",
      email: "rajesh@precisiontools.in",
      password: "Employer@123",
      role: "employer",
      phone: "9822011111",
      location: "Pimpri-Chinchwad, Maharashtra",
      isApproved: true,
      employerProfile: {
        workshopName: "Precision Tools & Dies Pvt. Ltd.",
        industryType: "Precision Machining & Tooling",
        companyDescription:
          "A mid-size manufacturing unit specializing in precision dies, jigs and fixtures for the automotive component industry.",
        website: "https://precisiontools.example.in",
      },
    },
    {
      name: "Sunita Deshmukh",
      email: "sunita@deshmukhelectricals.in",
      password: "Employer@123",
      role: "employer",
      phone: "9822022222",
      location: "Nashik, Maharashtra",
      isApproved: true,
      employerProfile: {
        workshopName: "Deshmukh Electricals & Switchgear",
        industryType: "Electrical Installation & Switchgear Manufacturing",
        companyDescription:
          "Electrical contracting and switchgear panel manufacturing firm serving industrial and commercial clients across North Maharashtra.",
        website: "https://deshmukhelectricals.example.in",
      },
    },
    {
      name: "Manoj Verma",
      email: "manoj@vermaautoworks.in",
      password: "Employer@123",
      role: "employer",
      phone: "9822033333",
      location: "Aurangabad, Maharashtra",
      isApproved: false, // left pending so the admin approval flow can be demoed
      employerProfile: {
        workshopName: "Verma Auto Works",
        industryType: "Automobile Repair & Servicing",
        companyDescription:
          "Multi-brand automobile service center handling two-wheeler and four-wheeler mechanical and electrical repairs.",
        website: "",
      },
    },
  ]);

  const [precisionTools, deshmukhElectricals, vermaAutoWorks] = employers;

  console.log("Creating student accounts...");
  const students = await User.create([
    {
      name: "Amit Pawar",
      email: "amit.pawar@example.in",
      password: "Student@123",
      role: "student",
      phone: "9765511111",
      location: "Pimpri, Maharashtra",
      studentProfile: {
        tradeSkills: ["Fitter", "Machinist"],
        itiInstituteName: "Government ITI, Pimpri",
        certificationDetails: "NCVT Fitter Trade Certificate, 2024",
        experienceYears: 0,
        bio: "Recently completed ITI Fitter trade, looking for my first apprenticeship in precision manufacturing.",
      },
    },
    {
      name: "Priya Shinde",
      email: "priya.shinde@example.in",
      password: "Student@123",
      role: "student",
      phone: "9765522222",
      location: "Nashik, Maharashtra",
      studentProfile: {
        tradeSkills: ["Electrician"],
        itiInstituteName: "Government ITI, Nashik Road",
        certificationDetails: "NCVT Electrician Trade Certificate, 2023",
        experienceYears: 1,
        bio: "One year of hands-on wiring and panel assembly experience during ITI industrial training.",
      },
    },
    {
      name: "Rahul Jadhav",
      email: "rahul.jadhav@example.in",
      password: "Student@123",
      role: "student",
      phone: "9765533333",
      location: "Aurangabad, Maharashtra",
      studentProfile: {
        tradeSkills: ["Welder", "Fitter"],
        itiInstituteName: "Government ITI, Aurangabad",
        certificationDetails: "NCVT Welder Trade Certificate, 2024",
        experienceYears: 0,
        bio: "Skilled in arc welding and gas cutting, eager to join an automotive fabrication workshop.",
      },
    },
  ]);

  const [amit, priya, rahul] = students;

  console.log("Creating job postings...");
  const jobs = await Job.create([
    {
      employer: precisionTools._id,
      title: "Apprentice Fitter - Precision Tooling",
      tradeSkill: "Fitter",
      additionalSkills: ["Machinist", "CNC Basics"],
      jobType: "Apprenticeship",
      workshopName: "Precision Tools & Dies Pvt. Ltd.",
      location: "Pimpri-Chinchwad, Maharashtra",
      description:
        "One-year apprenticeship under the National Apprenticeship Promotion Scheme, working alongside senior fitters on jig and fixture assembly for automotive dies.",
      requirements: "ITI certificate in Fitter trade. Freshers welcome.",
      stipendOrSalary: "Rs. 9,000 - 11,000 per month (as per NAPS stipend norms)",
      durationMonths: 12,
      vacancies: 3,
    },
    {
      employer: precisionTools._id,
      title: "CNC Machinist Trainee",
      tradeSkill: "Machinist",
      additionalSkills: ["CNC Programming", "Fitter"],
      jobType: "Apprenticeship",
      workshopName: "Precision Tools & Dies Pvt. Ltd.",
      location: "Pimpri-Chinchwad, Maharashtra",
      description:
        "Learn CNC turning and milling operations on VMC/CNC lathes under close supervision, with a path to a full-time machinist role.",
      requirements: "ITI Machinist/Fitter certificate. Basic knowledge of engineering drawing preferred.",
      stipendOrSalary: "Rs. 10,000 - 12,500 per month",
      durationMonths: 12,
      vacancies: 2,
    },
    {
      employer: deshmukhElectricals._id,
      title: "Apprentice Electrician - Industrial Panels",
      tradeSkill: "Electrician",
      additionalSkills: ["Panel Wiring", "PLC Basics"],
      jobType: "Apprenticeship",
      workshopName: "Deshmukh Electricals & Switchgear",
      location: "Nashik, Maharashtra",
      description:
        "Assist senior electricians in panel wiring, switchgear assembly and on-site industrial electrical installation work.",
      requirements: "ITI Electrician trade certificate. Willingness to travel to client sites within Nashik district.",
      stipendOrSalary: "Rs. 9,500 - 11,500 per month",
      durationMonths: 12,
      vacancies: 4,
    },
    {
      employer: deshmukhElectricals._id,
      title: "Junior Electrician - Full Time",
      tradeSkill: "Electrician",
      additionalSkills: ["Switchgear Assembly"],
      jobType: "Full-Time",
      workshopName: "Deshmukh Electricals & Switchgear",
      location: "Nashik, Maharashtra",
      description:
        "Full-time position for candidates who have completed at least one year of apprenticeship or equivalent experience in industrial electrical work.",
      requirements: "Minimum 1 year experience, ITI Electrician certificate required.",
      stipendOrSalary: "Rs. 15,000 - 18,000 per month",
      durationMonths: undefined,
      vacancies: 1,
    },
    {
      employer: vermaAutoWorks._id,
      title: "Apprentice Welder - Auto Fabrication",
      tradeSkill: "Welder",
      additionalSkills: ["Fitter", "Sheet Metal"],
      jobType: "Apprenticeship",
      workshopName: "Verma Auto Works",
      location: "Aurangabad, Maharashtra",
      description:
        "Hands-on apprenticeship in body repair welding and sheet metal fabrication for two-wheelers and light commercial vehicles.",
      requirements: "ITI Welder trade certificate preferred; sheet metal experience a plus.",
      stipendOrSalary: "Rs. 8,500 - 10,500 per month",
      durationMonths: 11,
      vacancies: 2,
    },
  ]);

  console.log("Creating sample applications...");
  await Application.create([
    {
      job: jobs[0]._id, // Apprentice Fitter at Precision Tools
      student: amit._id,
      employer: precisionTools._id,
      coverNote: "I completed my ITI Fitter trade this year and am very interested in precision tooling work.",
      status: "shortlisted",
    },
    {
      job: jobs[2]._id, // Apprentice Electrician at Deshmukh Electricals
      student: priya._id,
      employer: deshmukhElectricals._id,
      coverNote: "I have one year of hands-on wiring experience from my ITI industrial training.",
      status: "applied",
    },
    {
      job: jobs[4]._id, // Apprentice Welder at Verma Auto Works
      student: rahul._id,
      employer: vermaAutoWorks._id,
      coverNote: "Skilled in arc welding and gas cutting, keen to join your fabrication team.",
      status: "applied",
    },
  ]);

  console.log("\nSeed data created successfully!\n");
  console.log("Login credentials for testing:");
  console.log("  Admin:    admin@itiportal.in / Admin@12345");
  console.log("  Employer: rajesh@precisiontools.in / Employer@123 (approved)");
  console.log("  Employer: manoj@vermaautoworks.in / Employer@123 (pending approval)");
  console.log("  Student:  amit.pawar@example.in / Student@123");
  console.log("  Student:  priya.shinde@example.in / Student@123");
  console.log("  Student:  rahul.jadhav@example.in / Student@123\n");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
