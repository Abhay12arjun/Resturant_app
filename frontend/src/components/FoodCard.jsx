import { useCart } from "../context/CartContext";

const FoodCard = ({ food }) => {
    const { addToCart } = useCart();

    return (
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">

            <img
                src={food.image}
                alt={food.name}
                className="w-full h-40 object-cover"
            />

            <div className="p-4">
                <h3 className="font-semibold">{food.name}</h3>

                <p className="text-sm text-gray-500 mb-2">
                    ₹{food.price}
                </p>

                <button
                    onClick={() => addToCart(food)}
                    disabled={!food.isAvailable}
                    className={`w-full py-1.5 rounded-lg text-white ${!food.isAvailable ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}
                >
                    {food.isAvailable ? "Add to Cart" : "Unavailable"}
                </button>
            </div>
        </div>
    );
};

export default FoodCard;