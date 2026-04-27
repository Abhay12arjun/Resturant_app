import FoodForm from "./FoodForm";
import FoodList from "./FoodList";

export default function Food() {
    return (
        <div>
            <h2 className="text-xl font-bold mb-3">Food Management</h2>
            <FoodForm />
            <FoodList />
        </div>
    );
}