import { Link } from "react-router-dom";

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-[70vh] bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34b4')] bg-cover bg-center opacity-20" />

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Good Food,<br />
                        <span className="text-yellow-300">Brings People Together</span>
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto">
                        We're on a mission to deliver happiness, one delicious meal at a time.
                    </p>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-8 h-12 border-2 border-white rounded-full flex items-center justify-center">
                        <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Mission */}
            <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl p-10 md:p-16">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
                            OUR STORY
                        </span>
                        <h2 className="text-4xl font-bold text-gray-900">Our Mission</h2>
                    </div>

                    <p className="text-xl text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
                        At <span className="font-semibold text-orange-600">Foodie</span>, we believe great food should be easy to enjoy.
                        We connect food lovers with the best local restaurants and deliver happiness straight to your doorstep —
                        fresh, fast, and with love.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { number: "50K+", label: "Happy Customers" },
                        { number: "250+", label: "Restaurants" },
                        { number: "1.2M+", label: "Meals Delivered" },
                        { number: "30", label: "Cities" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-3xl p-8 shadow hover:shadow-xl transition-all">
                            <h3 className="text-5xl font-bold text-orange-600 mb-2">{stat.number}</h3>
                            <p className="text-gray-600 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-16">Why People Love Foodie</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: "⚡",
                                title: "Lightning Fast",
                                desc: "Average delivery time of 28 minutes across all cities."
                            },
                            {
                                icon: "🌟",
                                title: "Curated Restaurants",
                                desc: "Only the best-rated and most loved eateries on our platform."
                            },
                            {
                                icon: "🔒",
                                title: "Secure Payments",
                                desc: "100% secure transactions with multiple payment options."
                            },
                            {
                                icon: "❤️",
                                title: "Real Care",
                                desc: "Dedicated support team ready to help 24×7."
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="group p-8 bg-gray-50 hover:bg-orange-50 rounded-3xl transition-all hover:-translate-y-2"
                            >
                                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Our Story */}
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-8">How Foodie Began</h2>
                        <div className="space-y-8 text-gray-700">
                            <p className="text-lg leading-relaxed">
                                Foodie started in 2023 with a simple dream — to make ordering food as enjoyable as eating it.
                                What began as a small team delivering from 5 restaurants in Salem has now grown into a beloved platform
                                serving thousands of customers across multiple cities.
                            </p>
                            <p className="text-lg leading-relaxed">
                                Today, we partner with the finest restaurants and a dedicated fleet of delivery partners to ensure
                                every meal reaches you hot, fresh, and on time.
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
                            alt="Our Journey"
                            className="rounded-3xl shadow-2xl w-full"
                        />
                        <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-6 max-w-[220px]">
                            <p className="text-orange-600 font-semibold">“Food brings joy. We just make it faster.”</p>
                            <p className="text-sm mt-3 text-gray-500">- Founder, Foodie</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Values */}
            <div className="bg-gray-900 text-white py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12">Our Core Values</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Quality First", desc: "Every restaurant and meal must meet our strict quality standards." },
                            { title: "Speed with Care", desc: "Fast delivery, but never at the cost of food quality or safety." },
                            { title: "Customer Obsessed", desc: "Your happiness is our top priority. Every time." },
                        ].map((value, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/10 p-8 rounded-3xl hover:border-orange-500 transition-colors">
                                <h3 className="text-2xl font-semibold mb-4 text-orange-400">{value.title}</h3>
                                <p className="text-gray-300 leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-orange-600 to-pink-600 py-24 text-white text-center">
                <div className="max-w-2xl mx-auto px-6">
                    <h2 className="text-5xl font-bold mb-6">Ready to Taste the Difference?</h2>
                    <p className="text-xl mb-10 opacity-90">
                        Join thousands of happy food lovers who trust us with their cravings every day.
                    </p>
                    <Link
                        to="/menu"
                        className="inline-block bg-white text-orange-600 hover:bg-yellow-50 px-10 py-5 rounded-2xl text-xl font-semibold transition-all active:scale-95"
                    >
                        Start Ordering Now 🍔
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default About;