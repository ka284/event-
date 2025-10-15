"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./src/lib/db");
const eventTitles = [
    'Technology Innovation Summit', 'Digital Marketing Masterclass', 'AI & Machine Learning Conference',
    'Startup Funding Workshop', 'Blockchain Technology Forum', 'Cloud Computing Summit',
    'Cybersecurity Conference', 'Data Science Workshop', 'Mobile App Development Summit',
    'Web Development Bootcamp', 'UX/UI Design Conference', 'Product Management Workshop',
    'Digital Transformation Summit', 'E-commerce Excellence Forum', 'Social Media Marketing Conference',
    'Content Strategy Workshop', 'Brand Building Summit', 'Customer Experience Conference',
    'Sales Excellence Workshop', 'Leadership Development Summit', 'Team Building Conference',
    'Project Management Workshop', 'Agile Methodology Summit', 'DevOps Conference',
    'Software Architecture Workshop', 'Quality Assurance Summit', 'Testing Conference',
    'Business Intelligence Workshop', 'Analytics Summit', 'Big Data Conference',
    'IoT Technology Workshop', 'Smart Devices Summit', 'Wearable Tech Conference',
    'Virtual Reality Workshop', 'Augmented Reality Summit', 'Metaverse Conference',
    'Gaming Industry Workshop', 'Esports Summit', 'Game Development Conference',
    'FinTech Workshop', 'Digital Banking Summit', 'Cryptocurrency Conference',
    'EdTech Workshop', 'Online Learning Summit', 'Educational Technology Conference',
    'HealthTech Workshop', 'Telemedicine Summit', 'Digital Health Conference',
    'CleanTech Workshop', 'Renewable Energy Summit', 'Sustainability Conference',
    'Automotive Tech Workshop', 'Electric Vehicles Summit', 'Autonomous Driving Conference',
    'Aerospace Workshop', 'Space Technology Summit', 'Aviation Conference',
    'Biotech Workshop', 'Genomics Summit', 'Pharmaceutical Technology Conference',
    'AgriTech Workshop', 'Smart Farming Summit', 'Agricultural Technology Conference',
    'FoodTech Workshop', 'Culinary Innovation Summit', 'Restaurant Technology Conference',
    'FashionTech Workshop', 'Wearable Fashion Summit', 'Sustainable Fashion Conference',
    'Real Estate Tech Workshop', 'PropTech Summit', 'Smart Buildings Conference',
    'TravelTech Workshop', 'Hospitality Technology Summit', 'Tourism Innovation Conference',
    'SportsTech Workshop', 'Athletic Performance Summit', 'Sports Analytics Conference',
    'MusicTech Workshop', 'Audio Production Summit', 'Music Streaming Conference',
    'FilmTech Workshop', 'Video Production Summit', 'Entertainment Technology Conference',
    'LegalTech Workshop', 'Legal Automation Summit', 'Compliance Technology Conference'
];
const eventDescriptions = [
    'Join industry experts for a comprehensive exploration of cutting-edge technologies and innovative solutions.',
    'Discover the latest trends and best practices in this dynamic field through interactive sessions and networking.',
    'An immersive experience featuring thought leaders, hands-on workshops, and unparalleled networking opportunities.',
    'Learn from seasoned professionals and gain practical skills that you can immediately apply in your career.',
    'Connect with peers and industry leaders while exploring the future of technology and business innovation.',
    'A transformative event designed to equip you with the knowledge and tools needed to excel in today\'s competitive landscape.',
    'Experience the perfect blend of education, inspiration, and networking in this must-attend industry gathering.',
    'Gain valuable insights from experts who are shaping the future of their respective industries.',
    'Participate in engaging discussions, workshops, and presentations that will elevate your professional knowledge.',
    'Join us for an unforgettable journey of learning, networking, and professional growth.',
    'Explore emerging technologies and strategies that are revolutionizing the way we work and live.',
    'Connect with innovators and thought leaders who are driving change in their industries.',
    'Learn practical skills and strategies that you can implement immediately in your organization.',
    'Network with like-minded professionals and build lasting relationships that will advance your career.',
    'Discover new opportunities and gain the knowledge needed to stay ahead in a rapidly evolving landscape.',
    'An essential event for anyone looking to stay current with the latest industry developments.',
    'Join us for an inspiring day of learning, sharing, and connecting with industry peers.',
    'Gain competitive advantage through the latest insights and strategies from industry experts.',
    'Experience cutting-edge content and networking opportunities that will transform your approach.',
    'Learn from the best and brightest minds in the industry at this comprehensive educational event.',
    'Connect, learn, and grow with professionals who share your passion for excellence and innovation.'
];
const eventTypes = ['CONFERENCE', 'FESTIVAL', 'SUMMIT', 'WORKSHOP', 'SEMINAR', 'OTHER'];
// Convert USD to INR (approximately 1 USD = 83 INR)
const usdToInr = (usd) => {
    return Math.round(usd * 83);
};
const generateRandomPrice = () => {
    const basePrices = [99, 149, 199, 299, 399, 499, 599, 799, 999, 1299, 1599, 1999, 2499, 2999, 3999];
    return usdToInr(basePrices[Math.floor(Math.random() * basePrices.length)]);
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting to add 50 events to existing organizers...');
        try {
            // Get all existing organizers
            const organizers = yield db_1.db.organizer.findMany();
            if (organizers.length === 0) {
                console.log('❌ No organizers found. Please run the seed script first.');
                return;
            }
            console.log(`📊 Found ${organizers.length} existing organizers`);
            let eventsCreated = 0;
            // Create 50 events distributed among existing organizers
            for (let i = 0; i < 50; i++) {
                const organizer = organizers[i % organizers.length];
                try {
                    const event = yield db_1.db.event.create({
                        data: {
                            title: eventTitles[i % eventTitles.length],
                            description: eventDescriptions[Math.floor(Math.random() * eventDescriptions.length)],
                            type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
                            price: generateRandomPrice(),
                            organizerId: organizer.id
                        }
                    });
                    eventsCreated++;
                    console.log(`✅ Created event ${eventsCreated}: "${event.title}" for ${organizer.name} (₹${event.price.toLocaleString('en-IN')})`);
                }
                catch (error) {
                    console.error(`❌ Error creating event ${i + 1}:`, error);
                }
            }
            console.log('🎉 Successfully added events to existing organizers!');
            console.log(`📊 Total events created: ${eventsCreated}`);
            console.log('💰 All prices converted to Indian Rupees (INR)');
            // Count total events in database
            const totalEvents = yield db_1.db.event.count();
            console.log(`📈 Total events in database: ${totalEvents}`);
        }
        catch (error) {
            console.error('❌ Error in main process:', error);
        }
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.db.$disconnect();
}));
