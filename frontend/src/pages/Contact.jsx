import { Link } from "react-router-dom";

const Contact = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-2xl p-10 mb-10 shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
                    <p className="opacity-90">Questions? Feedback? We’re here to help — reach out anytime.</p>

                    <div className="mt-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 bg-white/10 p-6 rounded-lg">
                            <h3 className="font-semibold text-lg">Customer Support</h3>
                            <p className="mt-2">Our friendly team is available 9am — 10pm daily.</p>
                            <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                <a href="tel:+911234567890" className="inline-block bg-white text-indigo-600 px-4 py-2 rounded-lg">Call: +91 6209617453</a>
                                <a href="mailto:support@foodie.example" className="inline-block bg-white text-indigo-600 px-4 py-2 rounded-lg">Email: support@foodie.example</a>
                            </div>
                        </div>

                        <div className="flex-1 bg-white/10 p-6 rounded-lg">
                            <h3 className="font-semibold text-lg">Partnerships & Press</h3>
                            <p className="mt-2">For business inquiries, email partnerships@foodie.example</p>
                            <div className="mt-4">
                                <Link to="/menu" className="inline-block bg-white text-indigo-600 px-4 py-2 rounded-lg">Order Now</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow">
                        <h2 className="text-2xl font-bold mb-4">Where to find us</h2>
                        <p className="text-gray-600 mb-4">Our kitchens and partners are spread across your city. We deliver fast — but if you'd like to visit, here's our head office.</p>

                        {/* Map removed per request */}

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold">Address</h4>
                                <p className="text-gray-600">123 Foodie Street, Chennai, TN 600001</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Hours</h4>
                                <p className="text-gray-600">Mon — Sun: 9:00 AM — 10:00 PM</p>
                            </div>
                        </div>
                    </div>

                    <aside className="bg-white rounded-2xl p-6 shadow">
                        <h3 className="text-xl font-bold mb-3">Quick Links</h3>
                        <ul className="space-y-3 text-gray-700">
                            <li><Link to="/menu" className="text-indigo-600 font-medium hover:underline">Browse Menu</Link></li>
                            <li><Link to="/offers" className="text-indigo-600 font-medium hover:underline">View Offers</Link></li>
                            <li><a href="mailto:support@foodie.example" className="text-indigo-600 font-medium hover:underline">Email Support</a></li>
                            <li><a href="tel:+911234567890" className="text-indigo-600 font-medium hover:underline">Call Support</a></li>
                        </ul>

                        <div className="mt-6">
                            <h4 className="font-semibold mb-2">Follow us</h4>
                            <div className="flex gap-3">
                                <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-md bg-pink-500 text-white flex items-center justify-center">IG</a>
                                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-md bg-blue-500 text-white flex items-center justify-center">TW</a>
                                <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-md bg-blue-800 text-white flex items-center justify-center">FB</a>
                            </div>
                        </div>
                    </aside>
                </div>

                <div className="mt-12 bg-white rounded-2xl p-8 shadow">
                    <h3 className="text-2xl font-bold mb-4">Frequently Asked Questions</h3>
                    <div className="space-y-4 text-gray-700">
                        <div>
                            <h4 className="font-semibold">How do I report an issue with my order?</h4>
                            <p className="mt-2">Use the email support@foodie.example or call +91 6209617453 — we’ll respond within 2 hours.</p>
                        </div>

                        <div>
                            <h4 className="font-semibold">Can I change my delivery address after ordering?</h4>
                            <p className="mt-2">You can update the address from the order details page — contact support immediately for urgent updates.</p>
                        </div>

                        <div>
                            <h4 className="font-semibold">Do you offer corporate accounts?</h4>
                            <p className="mt-2">Yes — email partnerships@foodie.example for special pricing and account setup.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Contact;
