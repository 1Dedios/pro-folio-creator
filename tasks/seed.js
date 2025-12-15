import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { users, themes, portfolios, messages } from '../data/index.js';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

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
            backgroundColor: "#F9FAFB",
            sectionColor: "#FFFFFF",
            textColor: "#1F2937"
        },
        true // Example theme
    );

    const theme2 = await themes.createTheme(
        null, // System theme
        "Dark Professional",
        {
            backgroundColor: "#1F2937",
            sectionColor: "#111827",
            textColor: "#FFFFFF"
        },
        true // Example theme
    );

    const theme3 = await themes.createTheme(
        null, // System theme
        "Vibrant Creative",
        {
            backgroundColor: "#FFFFFF",
            sectionColor: "#F3F4F6",
            textColor: "#4F46E5"
        },
        true // Example theme
    );

    const theme4 = await themes.createTheme(
        user1._id, // User's custom theme
        "My Custom Theme",
        {
            backgroundColor: "#ECFDF5",
            sectionColor: "#D1FAE5",
            textColor: "#047857"
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
            }
        ],
        { singlePage: true, pages: [] },
        theme1._id,
        true, // Contact enabled
        true, // Example portfolio
        null
    );

    // Example portfolio 2 - UX Designer
    // Create sections first to get their IDs
    const portfolio2Sections = [
        {
            _id: new ObjectId(),
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
            _id: new ObjectId(),
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
            _id: new ObjectId(),
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
            _id: new ObjectId(),
            type: "custom",
            items: [
                {
                    title: "Design Philosophy",
                    content: "<p>I believe in user-centered design that balances aesthetics with functionality. My approach focuses on understanding user needs deeply before creating solutions.</p><p>Every pixel has a purpose, and every interaction should feel intuitive and delightful.</p>",
                    order: 1
                }
            ]
        }
    ];

    // Create portfolio with sections already assigned to pages
    const portfolio2 = await portfolios.createPortfolio(
        user2._id,
        "Jane's UX Design Portfolio",
        "A showcase of my user experience design work and case studies.",
        portfolio2Sections,
        { 
            singlePage: false, 
            pages: [
                {
                    title: "About",
                    sectionIds: [portfolio2Sections[0]._id, portfolio2Sections[3]._id] // Education and Design Philosophy
                },
                {
                    title: "Work",
                    sectionIds: [portfolio2Sections[1]._id] // Work experience
                },
                {
                    title: "Projects",
                    sectionIds: [portfolio2Sections[2]._id] // Projects
                }
            ] 
        },
        theme2._id,
        true, // Contact enabled
        true, // Example portfolio
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
        true
    );

    // Example portfolio 4 - Photographer/Artist Portfolio
    // Create sections first to get their IDs
    const portfolio4Sections = [
        {
            _id: new ObjectId(),
            type: "custom",
            items: [
                {
                    title: "About Me",
                    content: "<p>I'm a professional photographer specializing in portrait, landscape, and event photography. With over 8 years of experience capturing life's most precious moments, I bring a unique perspective to every shoot.</p><p>My work has been featured in several exhibitions and publications including National Geographic's online gallery and Modern Photography Magazine.</p>",
                    order: 1
                }
            ]
        },
        {
            _id: new ObjectId(),
            type: "custom",
            items: [
                {
                    title: "Skills & Expertise",
                    content: "<ul><li>Portrait Photography</li><li>Landscape Photography</li><li>Event Coverage</li><li>Adobe Lightroom & Photoshop</li><li>Studio Lighting</li><li>Drone Photography</li></ul>",
                    order: 1
                }
            ]
        },
        {
            _id: new ObjectId(),
            type: "project",
            items: [
                {
                    title: "Urban Landscapes",
                    description: "A series exploring the beauty in urban architecture and city life.",
                    technologies: ["DSLR Photography", "Drone", "Adobe Lightroom"],
                    startDate: new Date("2023-01-15"),
                    endDate: new Date("2023-06-30"),
                    githubRepo: null,
                    order: 1
                },
                {
                    title: "Portraits of Resilience",
                    description: "A portrait series documenting individuals who have overcome significant life challenges.",
                    technologies: ["Studio Photography", "Natural Lighting", "Black & White"],
                    startDate: new Date("2022-08-10"),
                    endDate: new Date("2023-02-28"),
                    githubRepo: null,
                    order: 2
                },
                {
                    title: "Wildlife Conservation Project",
                    description: "Documenting endangered species in their natural habitats for conservation awareness.",
                    technologies: ["Telephoto Photography", "Macro", "Environmental"],
                    startDate: new Date("2023-07-01"),
                    endDate: null, // Ongoing project
                    githubRepo: null,
                    order: 3
                }
            ]
        },
        {
            _id: new ObjectId(),
            type: "custom",
            items: [
                {
                    title: "Client Testimonials",
                    content: "<blockquote>\"Working with this photographer was an absolute pleasure. They captured our wedding day perfectly, with attention to every detail and emotion.\" <cite>- Maria & John, Wedding Clients</cite></blockquote><blockquote>\"The corporate event photos exceeded our expectations. Professional, creative, and delivered ahead of schedule.\" <cite>- TechCorp CEO</cite></blockquote>",
                    order: 1
                }
            ]
        },
        {
            _id: new ObjectId(),
            type: "certification",
            items: [
                {
                    title: "Professional Photography Certification",
                    issuer: "National Photography Institute",
                    issueDate: new Date("2020-03-15"),
                    expirationDate: null,
                    description: "Comprehensive certification in professional photography techniques and business practices.",
                    order: 1
                },
                {
                    title: "Adobe Certified Expert - Photoshop",
                    issuer: "Adobe",
                    issueDate: new Date("2021-09-10"),
                    expirationDate: new Date("2024-09-10"),
                    description: "Expert-level certification in Adobe Photoshop for professional photo editing.",
                    order: 2
                }
            ]
        }
    ];

    // Create portfolio with sections already assigned to pages
    const portfolio4 = await portfolios.createPortfolio(
        user3._id,
        "Creative Photography Portfolio",
        "A showcase of my photography work, creative projects, and client testimonials.",
        portfolio4Sections,
        { 
            singlePage: false, 
            pages: [
                {
                    title: "About",
                    sectionIds: [portfolio4Sections[0]._id, portfolio4Sections[1]._id, portfolio4Sections[4]._id] // About Me, Skills, and Certifications
                },
                {
                    title: "Portfolio",
                    sectionIds: [portfolio4Sections[2]._id] // Projects
                },
                {
                    title: "Testimonials",
                    sectionIds: [portfolio4Sections[3]._id] // Testimonials
                }
            ] 
        },
        theme3._id,
        true, // Contact enabled
        true, // Example portfolio
        null
    );

    // We don't need to update portfolio4 after creation because we can't update example portfolios
    // The sections will need to be assigned to pages in a different way

    // Create a new example portfolio similar to portfolio3
    const portfolio3Example = await portfolios.createPortfolio(
        user3._id,
        "Alex's Developer Portfolio",
        "A showcase of my development skills and projects - example version.",
        portfolio3.sections,
        portfolio3.layout,
        theme3._id,
        true, // Contact enabled
        true, // Example portfolio
        null
    );

    // Example portfolio 5 - Content Writer/Blogger Portfolio
    const portfolio5 = await portfolios.createPortfolio(
        user2._id,
        "Professional Writing Portfolio",
        "Showcasing my content writing, blogging, and copywriting work across various industries.",
        [
            {
                type: "custom",
                items: [
                    {
                        title: "Professional Summary",
                        content: "<p>I'm a versatile content writer with expertise in SEO optimization, blog writing, and technical documentation. With a background in journalism and digital marketing, I craft compelling narratives that engage readers and drive conversions.</p><p>My writing has helped businesses increase their organic traffic by an average of 45% and improve conversion rates through strategic content planning.</p>",
                        order: 1
                    }
                ]
            },
            {
                type: "work",
                items: [
                    {
                        company: "ContentFirst Agency",
                        role: "Senior Content Strategist",
                        startDate: new Date("2022-04-01"),
                        endDate: null, // Current position
                        description: "Develop comprehensive content strategies for B2B and B2C clients across technology, healthcare, and finance sectors.",
                        location: "Remote",
                        achievements: ["Increased client organic traffic by 65% through strategic keyword optimization", "Managed a team of 5 writers producing over 100 articles monthly", "Developed style guides for 12 major clients"],
                        order: 1
                    },
                    {
                        company: "TechBlog Network",
                        role: "Technology Writer",
                        startDate: new Date("2020-06-01"),
                        endDate: new Date("2022-03-15"),
                        description: "Wrote in-depth articles on emerging technologies, software reviews, and industry trends.",
                        location: "Chicago, IL",
                        achievements: ["Published 200+ articles with average 10K+ views each", "Interviewed C-level executives from Fortune 500 tech companies", "Covered major technology conferences and product launches"],
                        order: 2
                    }
                ]
            },
            {
                type: "custom",
                items: [
                    {
                        title: "Writing Samples",
                        content: "<h3>Technical Writing</h3><p>\"Understanding Microservices Architecture\" - A comprehensive guide to modern application development paradigms.</p><h3>SEO Content</h3><p>\"10 Proven Strategies to Boost Your Website's Organic Traffic\" - A data-driven approach to SEO optimization.</p><h3>Copywriting</h3><p>Product description samples for e-commerce clients in fashion, electronics, and home goods industries.</p>",
                        order: 1
                    }
                ]
            },
            {
                type: "custom",
                items: [
                    {
                        title: "Services Offered",
                        content: "<ul><li><strong>Blog Content Creation</strong> - Engaging, SEO-optimized blog posts tailored to your audience</li><li><strong>Technical Documentation</strong> - Clear, concise user guides and technical specifications</li><li><strong>Email Marketing Campaigns</strong> - Conversion-focused email sequences that drive results</li><li><strong>Website Copywriting</strong> - Compelling landing pages and product descriptions</li><li><strong>Content Strategy</strong> - Comprehensive content planning aligned with business goals</li></ul>",
                        order: 1
                    }
                ]
            },
            {
                type: "education",
                items: [
                    {
                        institution: "Northwestern University",
                        degree: "B.A. in Journalism",
                        startDate: new Date("2016-09-01"),
                        endDate: new Date("2020-05-15"),
                        description: "Specialized in digital media and content production. Editor of the university newspaper.",
                        location: "Evanston, IL",
                        order: 1
                    }
                ]
            }
        ],
        { 
            singlePage: true, 
            pages: [] 
        },
        theme1._id,
        true, // Contact enabled
        true, // Example portfolio
        null
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

    await messages.createMessage(
        portfolio4._id,
        "Emily Chen",
        "emily.chen@example.com",
        "Hello! I'm planning a wedding for next summer and love your photography style. Are you available for bookings in June 2025? I'd love to discuss your packages and availability."
    );

    await messages.createMessage(
        portfolio5._id,
        "David Thompson",
        "david.t@example.com",
        "I'm the marketing director at a SaaS startup, and we're looking to revamp our blog content. Your writing portfolio is impressive! Would you be interested in discussing a potential collaboration for ongoing content creation?"
    );

    console.log('Messages created successfully');

    console.log('Done seeding database');
    await closeConnection();
};

main().catch((error) => {
    console.error(error);
    closeConnection();
});
