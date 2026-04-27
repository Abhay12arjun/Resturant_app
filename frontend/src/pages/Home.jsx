import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 overflow-hidden">
            {/* Navbar - Simple & Clean */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">🍔</div>
                        <h1 className="text-2xl font-bold text-gray-900">Foodie</h1>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
                        <Link to="/menu" className="hover:text-indigo-600 transition">Menu</Link>
                        <Link to="/offers" className="hover:text-indigo-600 transition">Offers</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-20 min-h-[100dvh] flex items-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092')] bg-cover bg-center opacity-30" />

                <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-medium">4.9/5 from 12k+ happy customers</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
                            Craving something<br />
                            <span className="bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
                                delicious?
                            </span>
                        </h1>

                        <p className="text-xl text-gray-300 mb-10">
                            Order from the best restaurants near you.
                            Lightning-fast delivery, fresh & hot.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/menu"
                                className="bg-white text-indigo-950 hover:bg-white/90 px-8 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-95 flex items-center gap-3"
                            >
                                Explore Menu 🍕
                            </Link>

                            {!user ? (
                                <Link
                                    to="/signup"
                                    className="border border-white/70 hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-95"
                                >
                                    Get Started Free
                                </Link>
                            ) : (
                                <Link
                                    to={user.role === "admin" ? "/admin" : "/user"}
                                    className="border border-white/70 hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-95"
                                >
                                    {user.role === "admin" ? "Admin Dashboard" : "My Orders"}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold text-center mb-10">What are you craving?</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: "Veg", emoji: "🥗", color: "from-emerald-500 to-teal-500", value: "veg" },
                        { label: "Non-Veg", emoji: "🍗", color: "from-orange-500 to-red-500", value: "non-veg" },
                        { label: "Pizza", emoji: "🍕", color: "from-red-500 to-pink-500", value: "pizza" },
                        { label: "Burgers", emoji: "🍔", color: "from-amber-500 to-yellow-500", value: "burger" },
                    ].map((cat) => (
                        <Link
                            key={cat.value}
                            to={`/menu?category=${cat.value}`}
                            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className={`h-48 bg-gradient-to-br ${cat.color} flex items-center justify-center text-7xl group-hover:scale-110 transition-transform`}>
                                {cat.emoji}
                            </div>
                            <div className="p-6 text-center">
                                <p className="font-semibold text-xl text-gray-800">{cat.label}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">Why Foodies Love Us</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: "⚡", title: "Lightning Fast", desc: "Delivered in under 30 minutes" },
                        { icon: "🌟", title: "Top Restaurants", desc: "Curated selection of best eateries" },
                        { icon: "🔒", title: "Secure & Easy", desc: "Multiple payment options" },
                    ].map((item, i) => (
                        <div key={i} className="text-center group">
                            <div className="text-6xl mb-6 group-hover:scale-125 transition-transform">{item.icon}</div>
                            <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                            <p className="text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials */}
            <div className="bg-gradient-to-b from-gray-50 to-white py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">Real Stories, Real Love ❤️</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm">
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => (
                                        <span key={j} className="text-yellow-400 text-2xl">★</span>
                                    ))}
                                </div>
                                <p className="text-gray-700 italic mb-8">
                                    "The food arrived piping hot and tasted even better than the photos!
                                    Best delivery experience I've had."
                                </p>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 10}.jpg`}
                                        alt="user"
                                        className="w-12 h-12 rounded-2xl object-cover"
                                    />
                                    <div>
                                        <h4 className="font-semibold">Priya Sharma</h4>
                                        <p className="text-sm text-gray-500">Salem • 2 days ago</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-24 text-center">
                <div className="max-w-2xl mx-auto px-6">
                    <h2 className="text-5xl font-bold mb-6">Hungry? Let's fix that.</h2>
                    <p className="text-xl mb-10 opacity-90">Join 50,000+ food lovers getting delicious meals delivered daily.</p>
                    <Link
                        to="/menu"
                        className="inline-block bg-white text-indigo-700 hover:bg-amber-50 px-10 py-5 rounded-2xl text-xl font-semibold transition-all active:scale-95 shadow-xl"
                    >
                        Order Now • It's Free to Start
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 text-center">
                <p>© 2026 Foodie. Made with ❤️ for food lovers in India.</p>
            </footer>
        </div >
    );
};

export default Home;