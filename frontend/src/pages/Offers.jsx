const Offers = () => {
    const offers = [
        { title: "Flat 20% Off", desc: "Use code SAVE20 on orders above ₹499", bg: "from-green-400 to-emerald-500" },
        { title: "Buy 1 Get 1", desc: "Selected pizzas only", bg: "from-red-400 to-pink-500" },
        { title: "Free Delivery", desc: "Free delivery on orders above ₹299", bg: "from-indigo-400 to-violet-500" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8 text-center">Offers & Promos 🎉</h1>

                <div className="grid md:grid-cols-2 gap-6">
                    {offers.map((o, idx) => (
                        <div key={idx} className={`p-6 rounded-xl text-white bg-gradient-to-br ${o.bg}`}>
                            <h3 className="text-2xl font-bold mb-2">{o.title}</h3>
                            <p className="opacity-90">{o.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Offers;
