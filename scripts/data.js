/**
 * WORMHOLE Engine - Dataset Definition
 * Department of Computer Science & Engineering - Dayananda Sagar University
 * 5th Semester · Odd 2026–27 · Version 3.0
 */

const PERIODS = [
  { start: "08:30", end: "09:25", displayStart: "8:30 AM", displayEnd: "9:25 AM", label: "1st Period", id: 0 },
  { start: "09:25", end: "10:20", displayStart: "9:25 AM", displayEnd: "10:20 AM", label: "2nd Period", id: 1 },
  { start: "10:45", end: "11:40", displayStart: "10:45 AM", displayEnd: "11:40 AM", label: "3rd Period", id: 2 },
  { start: "11:40", end: "12:35", displayStart: "11:40 AM", displayEnd: "12:35 PM", label: "4th Period", id: 3 },
  { start: "13:50", end: "14:40", displayStart: "1:50 PM", displayEnd: "2:40 PM", label: "5th Period", id: 4 },
  { start: "14:40", end: "15:30", displayStart: "2:40 PM", displayEnd: "3:30 PM", label: "6th Period", id: 5 },
  { start: "15:30", end: "16:20", displayStart: "3:30 PM", displayEnd: "4:20 PM", label: "7th Period", id: 6 },
];

const BREAKS = [
  { afterPeriodIndex: 1, name: "Short Break", start: "10:20 AM", end: "10:45 AM", duration: "25 min" },
  { afterPeriodIndex: 3, name: "Lunch Interval", start: "12:35 PM", end: "1:50 PM", duration: "75 min" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SOFT_SKILLS = ["SOFT SKILL", "SOFT SKILL", "SOFT SKILL", "SOFT SKILL", "SOFT SKILL"];

const SECTIONS = {
  A: {
    advisor: "Prof. Namyapriya D",
    room: "A424",
    days: {
      Monday: ["ML-A1/GPU-A2 (513/508)", "ML-A1/GPU-A2 (513/508)", "SEMP", "ATC", "OS-LH4", "OS-LH4", "SPORTS"],
      Tuesday: ["IDS", "SEMP", "ML", "GPU", "CTS", "CTS", "PE-1"],
      Wednesday: ["ML", "GPU", "IDS", "OFFICE", "MOOC", "IDS", "OFFICE"],
      Thursday: ["ATC", "GPU", "SEMP", "CTS", "PE-1", "PE-1", "LIBRARY"],
      Friday: ["ATC", "ML", "ML-A2/GPU-A1 (513/508)", "ML-A2/GPU-A1 (513/508)", "MENTOR", "OS-LH4", "SPORTS"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Prof. Namyapriya D",
        labs: [
          { tag: "Lab 5A1", faculty: "Prof. Namyapriya D, Prof. Megha H N, Prof. Sagarika Biswas, Samson Alemayehu" },
          { tag: "Lab 5A2", faculty: "Prof. Namyapriya D, Prof. Sushma D S, Prof. Sriparna Paul, Prof. Anuj Patidar" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Dr. Rajesh Agarwal" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Prof. Shravankumar Dhangi",
        labs: [
          { tag: "Lab 5A1", faculty: "Dr. K Vengatesan, Dr. George Fernandez, Prof. Anurag Gupta, Tewodrose Tilahun Dejen" },
          { tag: "Lab 5A2", faculty: "Dr. K Vengatesan, Prof. Chethan K S, Dr. Chavva Subba Reddy, Tewodrose Tilahun Dejen" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Dr. Naresh P" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Dr. Nandini K" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof. Gaurav Kumar" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },

  B: {
    advisor: "Prof. Bharath B",
    room: "A431",
    days: {
      Monday: ["ML", "GPU", "SEPM", "IDS", "OS-LH4", "OS-LH4", "SPORTS"],
      Tuesday: ["ML-B1/GPU-B2 (513/508)", "ML-B1/GPU-B2 (513/508)", "CTS", "ML", "ATC", "MOOC", "PE-1"],
      Wednesday: ["IDS", "ATC", "GPU", "SEPM", "CTS", "CTS", "MENTOR"],
      Thursday: ["GPU", "IDS", "ML-B2/GPU-B1 (513/508)", "ML-B2/GPU-B1 (513/508)", "PE-1", "PE-1", "LIBRARY"],
      Friday: ["ATC", "ML", "SEPM", "OFFICE", "MENTOR", "OS-LH4", "SPORTS"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Dr Benaka Santhosha.S",
        labs: [
          { tag: "Lab 5B1", faculty: "Dr Benaka Santhosha.S, Prof. Santhosh M, Prof. Zunaid Akhtar, Aklilu Teklemariam Gossa" },
          { tag: "Lab 5B2", faculty: "Dr Benaka Santhosha.S, Prof. Santhosh M, Prof. Sumy Joseph, Prof. Rumpa Chakraborty" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Prof. Bharath B" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Prof. Manoj Kumar N I",
        labs: [
          { tag: "Lab 5B1", faculty: "Prof. Manoj Kumar N I, Prof. Pooja shree H R, Prof. Anupriya Bhushan, Tewodrose Tilahun Dejen" },
          { tag: "Lab 5B2", faculty: "Prof. Manoj Kumar N I, Prof. Chethan K S, Prof. Ritika Kumari, Dr. Girisha G S" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Dr. Shahin Fatima" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Dr. Girisha G S" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof Abhisek Midya" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },

  C: {
    advisor: "Prof. Soham Ghosh",
    room: "A432",
    days: {
      Monday: ["IDS", "ATC", "ML-C1/GPU-C2 (513/508)", "ML-C1/GPU-C2 (513/508)", "OS-LH4", "OS-LH4", "SPORTS"],
      Tuesday: ["ML", "CTS", "SEPM", "GPU", "IDS", "MOOC", "PE-1"],
      Wednesday: ["ML-C2/GPU-C1 (513/508)", "ML-C2/GPU-C1 (513/508)", "ATC", "ML", "CTS", "CTS", "MENTOR"],
      Thursday: ["SEPM", "GPU", "MENTOR", "IDS", "PE-1", "PE-1", "LIBRARY"],
      Friday: ["ML", "OFFICE", "ATC", "GPU", "SEPM-A424", "OS-LH4", "SPORTS"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Prof. Santhosh M (Room A432)",
        labs: [
          { tag: "Lab 5C1", faculty: "Prof. Santhosh M, Prof. Sruthi Yapalaparvi, Prof. Ritika Kumari" },
          { tag: "Lab 5C2", faculty: "Prof. Santhosh M, Dr. Benaka Santhosha.S, Prof. Ritika Kumari" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Prof. D. Karthik Naik" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Dr Meenakshi Malhotra",
        labs: [
          { tag: "Lab 5C1", faculty: "Dr. Meenakshi Malhotra, Prof. Fenita F, Prof. Rumpa Chakraborty, Biruk Wodajo Talacho" },
          { tag: "Lab 5C2", faculty: "Dr. Meenakshi Malhotra, Prof. Mayank Kumar, Prof. Akmal Ahmed, Biruk Wodajo Talacho" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Prof. Soham Ghosh" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Ritik Vijaykumar Chhatwani" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof. Pritam Biswas" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },

  D: {
    advisor: "Prof. Ritik Chhatwani",
    room: "A433",
    days: {
      Monday: ["CTS-A533", "ML-A533", "GPU", "SEPM", "ML-D2/GPU-D1 (513/508)", "ML-D2/GPU-D1 (513/508)", "SPORTS"],
      Tuesday: ["OS-LH4", "OS-LH4", "ML", "IDS", "ATC", "CTS", "PE-1"],
      Wednesday: ["CTS", "GPU", "IDS", "SEPM", "ATC", "MOOC", "MENTOR"],
      Thursday: ["ML-D1/GPU-D2 (513/508)", "ML-D1/GPU-D2 (513/508)", "SEPM", "OFFICE", "PE-1", "PE-1", "SPORTS"],
      Friday: ["GPU", "ATC", "ML", "OFFICE", "IDS-431", "SPORTS", "OS-LH4"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Prof. Shubhra Jyoti Paul",
        labs: [
          { tag: "Lab 5D1", faculty: "Prof. Shubhra Jyoti Paul, Prof. Md Zafar Imam, Prof. Manas Singha, Prof. Sriparna Paul" },
          { tag: "Lab 5D2", faculty: "Prof. Shubhra Jyoti Paul, Dr. Nandini K, Prof. Rumpa Chakraborty, Prof. Md Zafar Imam" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Prof. Shubham Mishra" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Dr. Kumar Dilip",
        labs: [
          { tag: "Lab 5D1", faculty: "Dr. Gowdham C, Prof. Pooja shree H R, Prof. Akmal Ahmed" },
          { tag: "Lab 5D2", faculty: "Dr. Gowdham C, Prof. Pooja shree H R, Dr. Naresh P" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Prof. Smriti Bharti" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Prof. Chandan Maji" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof. Sharath H A" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },

  E: {
    advisor: "Prof. Muthu Bala N",
    room: "A437",
    days: {
      Monday: ["GPU", "SEPM", "ML", "IDS", "CTS-A540", "MOOC", "SPORTS"],
      Tuesday: ["OS-LH4", "OS-LH4", "ML-E1/GPU-E2 (513/508)", "ML-E1/GPU-E2 (513/508)", "CTS", "MENTOR", "PE-1"],
      Wednesday: ["SEPM", "ML", "GPU", "IDS", "ATC", "CTS", "LIBRARY"],
      Thursday: ["ML", "SEPM", "LIBRARY", "OFFICE", "PE-1", "PE-1", "SPORTS"],
      Friday: ["ATC", "IDS", "ATC", "GPU", "ML-E2/GPU-E1 (513/508)", "ML-E2/GPU-E1 (513/508)", "OS-LH4"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Prof. Dipanjan Bhattacharjee",
        labs: [
          { tag: "Lab 5E1", faculty: "Prof. Dipanjan Bhattacharjee, Prof. Prolay Biswas, Prof. Spardha Sahu, Samson Alemayehu" },
          { tag: "Lab 5E2", faculty: "Prof. Dipanjan Bhattacharjee, Prof. Prolay Biswas, Prof. Spardha Sahu, Samson Alemayehu" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Prof. Vishwas D B" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Prof. Muthu Bala N",
        labs: [
          { tag: "Lab 5E1", faculty: "Prof. Muthu Bala N, Prof. Bharath B, Prof. Kriti Bakshi, Biruk Wodajo Talacho" },
          { tag: "Lab 5E2", faculty: "Prof. Muthu Bala N, Prof. Bharath B, Prof. Kriti Bakshi, Biruk Wodajo Talacho" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Prof. Pedda Nagyalla Maddaiah" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Prof. Arpita Paria" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof. Pooja Shree H R" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },

  F: {
    advisor: "Prof. Sweta Chopdar",
    room: "A438",
    days: {
      Monday: ["ML", "GPU", "SEPM", "IDS", "MOOC", "LIBRARY", "SPORTS"],
      Tuesday: ["OS-LH4", "OS-LH4", "ML", "CTS", "ML-F2/GPU-F1 (513/508)", "ML-F2/GPU-F1 (513/508)", "PE-1"],
      Wednesday: ["ATC", "IDS", "ML-F1/GPU-F2 (513/508)", "ML-F1/GPU-F2 (513/508)", "CTS", "CTS", "MENTOR"],
      Thursday: ["IDS", "SEPM", "ATC", "GPU", "PE-1", "PE-1", "SPORTS"],
      Friday: ["ATC", "SEPM", "ML", "GPU", "OFFICE", "MENTOR", "OS-LH4"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Prof. Mala B A",
        labs: [
          { tag: "Lab 5F1", faculty: "Prof. Mala B A, Prof. Soram Wanglen, Prof. Divyanshu Verma(2), Prof. Md Zafar Imam" },
          { tag: "Lab 5F2", faculty: "Prof. Mala B A, Prof. Sriparna Paul, Prof. Sagarika Biswas, Aklilu Teklemariam Gossa" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Dr. V. Karuppuchamy" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Prof. Sumy Joseph",
        labs: [
          { tag: "Lab 5F1", faculty: "Prof. Sumy Joseph, Dr. George Fernandez, Prof. Anupriya Bhushan" },
          { tag: "Lab 5F2", faculty: "Prof. Sumy Joseph, Prof. Shilpa Sudheendran, Prof. Bikram Jit Saha" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Prof. Sweta Chopdar" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Dr. Naitik S T" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof. Sushma D S" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },

  G: {
    advisor: "Prof. Chandan Maji",
    room: "B112",
    days: {
      Monday: ["ATC", "ML", "SEMP", "IDS", "GPU", "MOOC", "OS-LH4"],
      Tuesday: ["ATC-A438", "GPU-A438", "IDS-A437", "CTS-A437", "LIBRARY", "MENTOR", "PE-1"],
      Wednesday: ["ML", "IDS", "ATC-A438", "CTS-A438", "ML-G2/GPU-G1 (513/508)", "ML-G2/GPU-G1 (513/508)", "SPORTS"],
      Thursday: ["ML", "SEPM", "CTS-A431", "GPU-A431", "PE-1", "PE-1", "MENTOR"],
      Friday: ["ML-G1/GPU-G2 (513/508)", "ML-G1/GPU-G2 (513/508)", "OS-LH4", "OS-LH4", "SEPM", "OFFICE", "SPORTS"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Prof. Shraddha Choudhary",
        labs: [
          { tag: "Lab 5G1", faculty: "Prof. Shraddha Choudhary, Prof. Namyapriya D, Prof. Ghulam Haider, Solomon Tsegay Nibret" },
          { tag: "Lab 5G2", faculty: "Prof. Shraddha Choudhary, Dr. T.Gayathri, Prof. Zunaid Akhtar, Solomon Tsegay Nibret" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Dr. Chavva Subba Reddy" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Prof. Sonali Bairagi",
        labs: [
          { tag: "Lab 5G1", faculty: "Prof. Sonali Bairagi, Dr. Damodharan D, Prof. Saurav Kumar" },
          { tag: "Lab 5G2", faculty: "Prof. Sonali Bairagi, Dr. Kumar Dilip, Prof. Muthu Bala N, Prof. Arpita Paria" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Prof Prateek Jha" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Prof. Harsh Jha" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof. Megha H N" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },

  H: {
    advisor: "Prof. Praveen Gopal Gaonkar",
    room: "B015, B110, B122",
    days: {
      Monday: ["ML-H1/GPU-H2 (514/509)", "ML-H1/GPU-H2 (514/509)", "ATC-B015", "GPU-B015", "SEPM-A537", "MOOC", "OS-LH4"],
      Tuesday: ["SEPM-A437", "GPU-A437", "ML-A524", "SEPM-A524", "IDS-B110", "MENTOR", "PE-1"],
      Wednesday: ["ML-B110", "MENTOR", "ML-H2/GPU-H1 (514/509)", "ML-H2/GPU-H1 (514/509)", "IDS-B110", "CTS-B110", "CTS-B110"],
      Thursday: ["GPU-B122", "ML-B122", "ATC-B111", "CTS-437", "PE-1", "PE-1", "SPORTS"],
      Friday: ["LIBRARY", "OFFICE", "OS-LH4", "OS-LH4", "ATC-B122", "IDS-A540", "SPORTS"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Prof. Abhishek Kumar Pandey",
        labs: [
          { tag: "Lab 5H1", faculty: "Prof. Abhishek Kumar Pandey, Prof. Sushma D S, Samson Alemayehu" },
          { tag: "Lab 5H2", faculty: "Prof. Abhishek Kumar Pandey, Dr. Gousia Thahniyath, Dr. Gowdham C, Prof. Tarun Saini" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Prof. Diana George" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Prof. Shilpa Sudheendran",
        labs: [
          { tag: "Lab 5H1", faculty: "Prof. Shilpa Sudheendran, Prof. Sandipan Laha, Prof. Sweta Chopdar" },
          { tag: "Lab 5H2", faculty: "Prof. Shilpa Sudheendran, Prof. Pooja shree H R, Dr. Chavva Subba Reddy" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Dr. Gowdham C" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Prof. Yashpal Gupta S" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof. A Prakash" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },

  I: {
    advisor: "Prof. Gaurav Kumar",
    room: "B111",
    days: {
      Monday: ["ML-A541", "IDS-A541", "ML-I1/GPU-I2 (514/509)", "ML-I1/GPU-I2 (514/509)", "ATC", "MOOC", "OS-LH4"],
      Tuesday: ["ATC", "GPU", "ML", "SEPM", "IDS", "MENTOR", "PE-1"],
      Wednesday: ["SEPM", "GPU", "CTS", "ML", "SEPM", "IDS", "SPORTS"],
      Thursday: ["ML-I2/GPU-I1 (514/509)", "ML-I2/GPU-I1 (514/509)", "OFFICE", "ATC-A433", "PE-1", "PE-1", "GPU"],
      Friday: ["LIBRARY", "MENTOR", "OS-LH4", "OS-LH4", "CTS-A433", "CTS-A433", "SPORTS"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Dr. Chetan V Sagarnal",
        labs: [
          { tag: "Lab 5I1", faculty: "Dr. Chetan V Sagarnal, Prof. Sagarika Biswas, Prof. Sriparna Paul, Girmay Tekle Berhe" },
          { tag: "Lab 5I2", faculty: "Dr. Chetan V Sagarnal, Prof. Debjit Pahari, Prof. Pabitra Kundu, Girmay Tekle Berhe" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Dr. Damodharan D" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Dr. Guruprasad M S",
        labs: [
          { tag: "Lab 5I1", faculty: "Dr. Guruprasad M S, Prof. Yashpal Gupta S, Prof. Kriti Bakshi" },
          { tag: "Lab 5I2", faculty: "Dr. Guruprasad M S, Prof. Yashpal Gupta S, Prof. Kriti Bakshi, Dr. George Fernandez" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Dr. Tanvir H Sardar" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Dr. Rupam Bhagawati" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof. Shubham Upadhyay" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },

  J: {
    advisor: "Prof. Prateek Jha",
    room: "A520",
    days: {
      Monday: ["IDS-A531", "GPU-A531", "ML", "ATC", "MENTOR", "CTS-A532", "SPORTS"],
      Tuesday: ["ML-J1/GPU-J2 (514/509)", "ML-J1/GPU-J2 (514/509)", "ML", "GPU", "IDS", "SEPM", "PE-1"],
      Wednesday: ["ML", "ATC", "SEPM-A531", "IDS-A531", "CTS-A532", "MOOC", "OS-LH4"],
      Thursday: ["ATC", "GPU", "OS-LH4", "OS-LH4", "PE-1", "PE-1", "MENTOR"],
      Friday: ["LIBRARY", "OFFICE", "ML-J2/GPU-J1 (514/509)", "ML-J2/GPU-J1 (514/509)", "SEPM", "CTS", "SPORTS"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Prof. Md Zafar Imam",
        labs: [
          { tag: "Lab 5J1", faculty: "Prof. Zunaid Akhtar, Dr. Gowdham C, Prof. Harijit Tripura, Girmay Tekle Berhe" },
          { tag: "Lab 5J2", faculty: "Prof. Zunaid Akhtar, Prof. Shravankumar Dhangi, Prof. Shubham Mishra, Girmay Tekle Berhe" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Dr. Mouleeswaran SK" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Dr. Bipin Kumar Rai",
        labs: [
          { tag: "Lab 5J1", faculty: "Dr. Shahin Fatima, Dr. Damodharan D, Dr. Chavva Subba Reddy" },
          { tag: "Lab 5J2", faculty: "Dr. Shahin Fatima, Dr. V Karuppuchamy, Prof. Anuj Patidar" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Dr. Arunkumar Gopu" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Dr. Prabhakar M" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof. Spardha Sahu" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },

  K: {
    advisor: "Prof. Megha H N",
    room: "A521",
    days: {
      Monday: ["ATC-A532", "SEPM-A532", "ML", "IDS", "MOOC", "GPU", "SPORTS"],
      Tuesday: ["ATC-A532", "SEPM", "ML-K2/GPU-K1 (514/509)", "ML-K2/GPU-K1 (514/509)", "IDS-A524", "CTS-A524", "PE-1"],
      Wednesday: ["GPU", "ML", "ATC", "SEPM", "IDS", "LIBRARY", "OS-LH4"],
      Thursday: ["GPU", "CTS", "OS-LH4", "OS-LH4", "PE-1", "PE-1", "SPORTS"],
      Friday: ["ML-K1/GPU-K2 (514/509)", "ML-K1/GPU-K2 (514/509)", "SPORTS", "SPORTS", "ML", "CTS", "SPORTS"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Dr. Shashikiran V",
        labs: [
          { tag: "Lab 5K1", faculty: "Dr. Shashikiran V, Dr. Nandini K, Prof. Mala B A, Aklilu Teklemariam Gossa" },
          { tag: "Lab 5K2", faculty: "Dr. Shashikiran V, Prof. Rumpa Chakraborty, Prof. Ritika Kumari, Aklilu Teklemariam Gossa" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Prof. Tanaya Bala Behera" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Prof. Bikram Jit Saha",
        labs: [
          { tag: "Lab 5K1", faculty: "Prof. Bikram Jit Saha, Prof. Diana George, Prof. Nafees Raza" },
          { tag: "Lab 5K2", faculty: "Prof. Fenita F, Prof. Nafees Raza, Dr. V Karuppuchamy" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Prof. Rohit Kumar Singh" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Dr. Basavaraj N Hiremath" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof. Kriti Bakshi" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },

  L: {
    advisor: "Prof. Anisha Dawar",
    room: "A522",
    days: {
      Monday: ["ATC-A537", "GPU-A537", "SEPM", "ML-5L", "IDS", "CTS", "SPORTS"],
      Tuesday: ["GPU", "ML-5L", "CTS-A531", "SEPM-A531", "ML-L1/GPU-L2 (514/509)", "ML-L1/GPU-L2 (514/509)", "PE-1"],
      Wednesday: ["IDS", "GPU", "ML-5L", "ATC", "CTS-A537", "MOOC", "OS-LH4"],
      Thursday: ["ATC-A537", "SEPM-A537", "OS-LH4", "OS-LH4", "PE-1", "PE-1", "IDS-5L"],
      Friday: ["LIBRARY", "OFFICE", "LIBRARY", "MENTOR", "ML-L2/GPU-L1 (514/509)", "ML-L2/GPU-L1 (514/509)", "SPORTS"],
      Saturday: ["MOOC", "MOOC", ...SOFT_SKILLS],
    },
    courses: [
      {
        code: "24CS3501",
        name: "GPU Architecture & Programming",
        faculty: "Prof. Priya Pudke",
        labs: [
          { tag: "Lab 5L1", faculty: "Prof. Priya Pudke, Prof. Tarun Saini, Prof. Goutham T R, Solomon Tsegay Nibret" },
          { tag: "Lab 5L2", faculty: "Prof. Priya Pudke, Dr. Chetan V Sagarnal, Prof. Sushma D S, Solomon Tsegay Nibret" },
        ],
      },
      { code: "24CS3502", name: "AI-Driven Software Engineering & PM", faculty: "Dr. Senthil Kumar" },
      {
        code: "24CS3503",
        name: "Machine Learning",
        faculty: "Prof. Yashaswini H C",
        labs: [
          { tag: "Lab 5L1", faculty: "Prof. Yashaswini H C, Dr. Shadab Siddiqui, Prof. Sonali Bairagi, Tewodrose Tilahun Dejen" },
          { tag: "Lab 5L2", faculty: "Prof. Yashaswini H C, Prof. Manoj Kumar N I, Prof. Sonali Bairagi" },
        ],
      },
      { code: "24CS3504", name: "Introduction to Data Science", faculty: "Prof. Ayush Yadav" },
      { code: "24CS3505", name: "Operating Systems", faculty: "Prof. Anisha Dawar" },
      { code: "24CS3506", name: "Automata Theory & Compiler Design", faculty: "Prof. Prolay Biswas" },
      { code: "24CS35XX", name: "Professional Elective I / MOOC", faculty: "See Electives Directory" },
      { code: "24CS3507", name: "Cognitive & Technical Skills–V", faculty: "Department Faculty" },
    ],
  },
};

const ELECTIVES = [
  {
    no: 1,
    name: "24CS3508 — AI for Business Analytics",
    code: "24CS3508",
    facultyList: [
      { name: "Prof. Goutham T R (Gowtham)", room: "A432" },
      { name: "Prof. Sruthi Yapalaparvi", room: "A424" },
      { name: "Prof. Pooja shree H R", room: "A431" },
      { name: "Prof. Prajwal S P", room: "A433" },
      { name: "Prof. Sriparna Paul", room: "A437" },
    ],
    rows: [
      ["Prof. Goutham T R (Gowtham)", "A432"],
      ["Prof. Sruthi Yapalaparvi", "A424"],
      ["Prof. Pooja shree H R", "A431"],
      ["Prof. Prajwal S P", "A433"],
      ["Prof. Sriparna Paul", "A437"],
    ],
  },
  {
    no: 2,
    name: "24CS3509 — Deep Learning",
    code: "24CS3509",
    facultyList: [
      { name: "Prof. Anand M", room: "A302" },
      { name: "Prof. Rajesh K", room: "A303" },
    ],
    rows: [
      ["Prof. Anand M", "A302"],
      ["Prof. Rajesh K", "A303"],
    ],
  },
  {
    no: 3,
    name: "24CS3511 — Cloud Computing",
    code: "24CS3511",
    facultyList: [
      { name: "Dr. George Fernandez", room: "A524" },
      { name: "Dr. Sridhar S K", room: "A540" },
      { name: "Dr. Shadab Siddiqui", room: "A541" },
      { name: "Prof. Praveen Gopal Gaonkar", room: "A520" },
      { name: "Prof. Gurmeet Kaur", room: "A521" },
    ],
    rows: [
      ["Dr. George Fernandez", "A524"],
      ["Dr. Sridhar S K", "A540"],
      ["Dr. Shadab Siddiqui", "A541"],
      ["Prof. Praveen Gopal Gaonkar", "A520"],
      ["Prof. Gurmeet Kaur", "A521"],
    ],
  },
  {
    no: 4,
    name: "24CS3512 — Introduction to XR & Immersive Technologies",
    code: "24CS3512",
    facultyList: [{ name: "Dr. J.S. Nixon", room: "A522" }],
    rows: [["Dr. J.S. Nixon", "A522"]],
  },
  {
    no: 5,
    name: "24CS3513 — Computer Graphics",
    code: "24CS3513",
    facultyList: [{ name: "Prof. Rumpa Chakraborty", room: "A438" }],
    rows: [["Prof. Rumpa Chakraborty", "A438"]],
  },
];

/**
 * Verified DSU ERP Attendance State (ENG24CS0537 - N BHARATH)
 * Synchronized with ums.mydsi.org (Odd 2026-27 Sem 5)
 */
const DEFAULT_STUDENT_PROFILE = {
  name: "N BHARATH",
  usn: "ENG24CS0537",
  srNo: "92693",
  section: "H",
  labBatch: 2, // 5H2 (Batch 2)
  pe1: {
    code: "24CS3508",
    name: "AI for Business Analytics",
    faculty: "Prof. Goutham T R (Gowtham)",
    room: "A432",
  },
};

const DEFAULT_DSU_ATTENDANCE = {
  student: {
    name: "N BHARATH",
    usn: "ENG24CS0537",
    semester: "Semester - 5 (2026-27 - Odd)",
    overallPct: 88.24,
    totalConducted: 17,
    totalPresent: 15,
    totalAbsent: 2,
  },
  courses: [
    {
      code: "24CS3501",
      name: "GPU ARCHITECTURE & PROGRAMMING",
      faculty: "Mr. ABHISHEK KUMAR PANDEY (95164)",
      conducted: 3,
      present: 3,
      absent: 0,
      pct: 100.0,
      type: "Theory",
    },
    {
      code: "24CS3502",
      name: "AI-DRIVEN SOFTWARE ENGINEERING & PM",
      faculty: "Ms. DIANA GEORGE (93944)",
      conducted: 2,
      present: 2,
      absent: 0,
      pct: 100.0,
      type: "Theory",
    },
    {
      code: "24CS3503",
      name: "MACHINE LEARNING",
      faculty: "Ms. Shilpa Sudheendran (92603)",
      conducted: 4,
      present: 4,
      absent: 0,
      pct: 100.0,
      type: "Theory + Practical",
    },
    {
      code: "24CS3504",
      name: "INTRODUCTION TO DATA SCIENCE",
      faculty: "Dr. C. GOWDHAM (95010)",
      conducted: 3,
      present: 2,
      absent: 1,
      pct: 66.67,
      type: "Theory",
    },
    {
      code: "24CS3505",
      name: "OPERATING SYSTEMS",
      faculty: "Mr. YASHPAL GUPTA S (92426)",
      conducted: 2,
      present: 1,
      absent: 1,
      pct: 50.0,
      type: "Theory",
    },
    {
      code: "24CS3506",
      name: "AUTOMATA THEORY & COMPILER DESIGN",
      faculty: "Mr. A. PRAKASH (95208)",
      conducted: 3,
      present: 3,
      absent: 0,
      pct: 100.0,
      type: "Theory",
    },
    {
      code: "24CS3508",
      name: "AI FOR BUSINESS ANALYTICS (PE-1)",
      faculty: "Prof. Goutham T R (Gowtham)",
      conducted: 0,
      present: 0,
      absent: 0,
      pct: 100.0,
      type: "Elective",
    },
  ],
};

