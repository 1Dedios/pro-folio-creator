import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { users, themes, portfolios, messages } from '../data/index.js';
import bcrypt from 'bcrypt';

const main = async () => {
    const db = await dbConnection();
    await db.dropDatabase();

    console.log('Starting to seed database...');

    // Create sample users
    console.log('Creating users...');
    const user1 = await users.createUser(
        "devwalker",
        "walker.dev@example.com",
        "Password123!"
    );

    const user2 = await users.createUser(
        "janesmith",
        "jane.smith@example.com",
        "Secure456!"
    );

    const user3 = await users.createUser(
        "alexrivera",
        "alex.r@example.com",
        "StrongPwd789!"
    );

    console.log('Users created successfully');

    // Create sample themes
    console.log('Creating themes...');
    const theme1 = await themes.createTheme(
        null, // System theme
        "Modern Minimal",
        {
            primaryColor: "#1F2937",
            accentColor: "#3B82F6",
            background: "#F9FAFB",
            fontFamily: "Inter"
        },
        true // Example theme
    );

    const theme2 = await themes.createTheme(
        null, // System theme
        "Dark Professional",
        {
            primaryColor: "#111827",
            accentColor: "#6D28D9",
            background: "#1F2937",
            fontFamily: "Roboto"
        },
        true // Example theme
    );

    const theme3 = await themes.createTheme(
        null, // System theme
        "Vibrant Creative",
        {
            primaryColor: "#4F46E5",
            accentColor: "#EC4899",
            background: "#FFFFFF",
            fontFamily: "Poppins"
        },
        true // Example theme
    );

    const theme4 = await themes.createTheme(
        user1._id, // User's custom theme
        "My Custom Theme",
        {
            primaryColor: "#047857",
            accentColor: "#F59E0B",
            background: "#ECFDF5",
            fontFamily: "Montserrat"
        },
        false // Not an example theme
    );

    console.log('Themes created successfully');

    // Create sample portfolios
    console.log('Creating portfolios...');

    // Example portfolio 1 - Software Engineer
    const portfolio1 = await portfolios.createPortfolio(
        user1._id,
        "Walker's Software Portfolio",
        "Showcasing my best engineering projects and open source work.",
        [
            {
                type: "education",
                items: [
                    {
                        institution: "West Virginia University",
                        degree: "B.S. in Computer Science",
                        startDate: new Date("2016-08-01"),
                        endDate: new Date("2020-05-01"),
                        description: "Graduated with honors. Focused on software engineering and AI courses.",
                        location: "Morgantown, WV, USA",
                        order: 1
                    },
                    {
                        institution: "Stanford University",
                        degree: "M.S. in Computer Science",
                        startDate: new Date("2020-09-01"),
                        endDate: new Date("2022-06-01"),
                        description: "Specialized in distributed systems and machine learning.",
                        location: "Stanford, CA, USA",
                        order: 2
                    }
                ]
            },
            {
                type: "work",
                items: [
                    {
                        company: "TechNova Inc.",
                        role: "Frontend Engineer",
                        startDate: new Date("2021-02-01"),
                        endDate: new Date("2024-10-01"),
                        description: "Developed high-performance Angular applications for large clients.",
                        location: "Remote (WV, USA)",
                        achievements: ["Led migration to Angular 16", "Reduced load times by 35%"],
                        order: 1
                    },
                    {
                        company: "DataSphere",
                        role: "Software Engineer Intern",
                        startDate: new Date("2019-05-01"),
                        endDate: new Date("2019-08-01"),
                        description: "Worked on backend services using Node.js and MongoDB.",
                        location: "San Francisco, CA",
                        achievements: ["Implemented new API endpoints", "Improved test coverage by 20%"],
                        order: 2
                    }
                ]
            },
            {
                type: "certification",
                items: [
                    {
                        title: "AWS Certified Developer – Associate",
                        issuer: "Amazon Web Services",
                        issueDate: new Date("2023-05-15"),
                        expirationDate: new Date("2026-05-15"),
                        description: "Validated knowledge of AWS services and serverless architecture.",
                        order: 1
                    },
                    {
                        title: "Google Cloud Professional Developer",
                        issuer: "Google",
                        issueDate: new Date("2022-11-10"),
                        expirationDate: new Date("2025-11-10"),
                        description: "Demonstrated expertise in building scalable applications on Google Cloud.",
                        order: 2
                    }
                ]
            },
            {
                type: "project",
                items: [
                    {
                        title: "Portfolio Builder Web App",
                        description: "An interactive portfolio generator with GitHub integration and rich text customization.",
                        technologies: ["Angular", "Node.js", "MongoDB"],
                        startDate: new Date("2024-01-05"),
                        endDate: new Date("2024-06-20"),
                        githubRepo: "https://github.com/devwalker/portfolio-builder",
                        order: 1
                    },
                    {
                        title: "Smart Home Automation System",
                        description: "IoT system for controlling home devices with voice commands and scheduling.",
                        technologies: ["Python", "Raspberry Pi", "MQTT", "React Native"],
                        startDate: new Date("2023-03-10"),
                        endDate: new Date("2023-09-15"),
                        githubRepo: "https://github.com/devwalker/smart-home",
                        order: 2
                    }
                ]
            },
            {
                type: "custom",
                items: [
                    {
                        title: "Awards & Recognition",
                        content: "<p>Recipient of 2024 State Innovation Award for Open Source Contributions.</p><p>First place in the 2023 National Hackathon for Sustainable Technology.</p>",
                        order: 1
                    }
                ]
            }
        ],
        { singlePage: true, pages: [] },
        theme1._id,
        true, // Contact enabled
        "walker.dev@example.com",
        true, // Example portfolio
        null
    );

    // Example portfolio 2 - UX Designer
    const portfolio2 = await portfolios.createPortfolio(
        user2._id,
        "Jane's UX Design Portfolio",
        "A showcase of my user experience design work and case studies.",
        [
            {
                type: "education",
                items: [
                    {
                        institution: "Rhode Island School of Design",
                        degree: "BFA in Graphic Design",
                        startDate: new Date("2017-09-01"),
                        endDate: new Date("2021-05-01"),
                        description: "Focused on digital interfaces and user experience design.",
                        location: "Providence, RI, USA",
                        order: 1
                    }
                ]
            },
            {
                type: "work",
                items: [
                    {
                        company: "DesignHub Agency",
                        role: "Senior UX Designer",
                        startDate: new Date("2022-03-01"),
                        endDate: null, // Current job
                        description: "Lead designer for web and mobile applications for Fortune 500 clients.",
                        location: "Boston, MA (Remote)",
                        achievements: ["Redesigned e-commerce platform increasing conversions by 28%", "Established design system used across 12 products"],
                        order: 1
                    },
                    {
                        company: "CreativeTech",
                        role: "Junior Designer",
                        startDate: new Date("2021-06-01"),
                        endDate: new Date("2022-02-01"),
                        description: "Worked on UI/UX for mobile applications.",
                        location: "New York, NY",
                        achievements: ["Designed award-winning fitness app interface", "Conducted user research and usability testing"],
                        order: 2
                    }
                ]
            },
            {
                type: "project",
                items: [
                    {
                        title: "HealthTrack App Redesign",
                        description: "Complete redesign of a health tracking application to improve user engagement and retention.",
                        technologies: ["Figma", "Adobe XD", "Sketch"],
                        startDate: new Date("2023-05-01"),
                        endDate: new Date("2023-08-15"),
                        githubRepo: null,
                        order: 1
                    },
                    {
                        title: "Financial Dashboard",
                        description: "Data visualization dashboard for personal finance management.",
                        technologies: ["Figma", "D3.js", "React"],
                        startDate: new Date("2022-11-01"),
                        endDate: new Date("2023-02-10"),
                        githubRepo: "https://github.com/janesmith/finance-dashboard",
                        order: 2
                    }
                ]
            },
            {
                type: "custom",
                items: [
                    {
                        title: "Design Philosophy",
                        content: "<p>I believe in user-centered design that balances aesthetics with functionality. My approach focuses on understanding user needs deeply before creating solutions.</p><p>Every pixel has a purpose, and every interaction should feel intuitive and delightful.</p>",
                        order: 1
                    }
                ]
            }
        ],
        { 
            singlePage: false, 
            pages: [
                {
                    title: "About",
                    sectionIds: [] // Will be populated after creation
                },
                {
                    title: "Work",
                    sectionIds: [] // Will be populated after creation
                },
                {
                    title: "Projects",
                    sectionIds: [] // Will be populated after creation
                }
            ] 
        },
        theme2._id,
        true, // Contact enabled
        "jane.smith@example.com",
        false, // Not an example portfolio
        null
    );

    // User 3's portfolio (cloned from example)
    const portfolio3 = await portfolios.clonePortfolio(
        portfolio1._id,
        user3._id,
        "Alex's Developer Portfolio"
    );

    // Update portfolio3 to use a different theme
    await portfolios.updatePortfolio(
        portfolio3._id,
        "Alex's Developer Portfolio",
        "My journey as a full-stack developer and the projects I've built.",
        portfolio3.sections,
        portfolio3.layout,
        theme3._id,
        true,
        "alex.r@example.com"
    );

    console.log('Portfolios created successfully');

    // Create sample messages
    console.log('Creating messages...');
    await messages.createMessage(
        portfolio1._id,
        "Alex Rivera",
        "alex.r@example.com",
        "Hi! I loved your portfolio and would like to discuss a collaboration on an open-source project I'm working on. Let me know if you're interested!"
    );

    await messages.createMessage(
        portfolio2._id,
        "Michael Johnson",
        "michael.j@example.com",
        "Hello Jane, I'm impressed by your UX work. Our startup is looking for a designer for a new product. Would you be available for a quick chat this week?"
    );

    await messages.createMessage(
        portfolio2._id,
        "Sarah Williams",
        "sarah.w@example.com",
        "Your design portfolio is amazing! I'm a CS student looking to improve my UI skills. Do you offer any mentoring or have resources you'd recommend?"
    );

    console.log('Messages created successfully');

    console.log('Done seeding database');
    await closeConnection();
};

main().catch((error) => {
    console.error(error);
    closeConnection();
});
