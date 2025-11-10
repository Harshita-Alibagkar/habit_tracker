import React, { useState } from "react";
import { Plus } from "lucide-react";

type Habit = {
  id: number;
  name: string;
  progress: {
    [year: number]: {
      [month: number]: Record<number, string>; // day → state ("", "partial", "complete")
    };
  };
};

// ✅ initialize days for a month
const initializeHabitDays = (year: number, month: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Record<number, string> = {};
  for (let d = 1; d <= daysInMonth; d++) days[d] = "";
  return days;
};

const App: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // ✅ handle adding a new habit
  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const days = initializeHabitDays(currentYear, currentMonth);
    const newHabit: Habit = {
      id: Date.now(),
      name: newHabitName,
      progress: { [currentYear]: { [currentMonth]: days } },
    };
    setHabits([...habits, newHabit]);
    setNewHabitName("");
    setShowPopup(false);
  };

  // ✅ toggle logic for 3-state (empty → partial → complete → empty)
  const toggleHabitDay = (habitId: number, day: number) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === habitId) {
          const yearData = habit.progress[currentYear] || {};
          const monthData = yearData[currentMonth] || initializeHabitDays(currentYear, currentMonth);
          const current = monthData[day] || "";
          const next =
            current === ""
              ? "partial"
              : current === "partial"
              ? "complete"
              : "";

          return {
            ...habit,
            progress: {
              ...habit.progress,
              [currentYear]: {
                ...yearData,
                [currentMonth]: { ...monthData, [day]: next },
              },
            },
          };
        }
        return habit;
      })
    );
  };

  // ✅ Month navigation
  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="text-gray-600 hover:text-gray-900 text-xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h1>
          <button
            onClick={nextMonth}
            className="text-gray-600 hover:text-gray-900 text-xl"
          >
            →
          </button>
        </div>

        <button
          onClick={() => setShowPopup(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-3 shadow-md"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Habit Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-2xl border border-gray-200">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border border-gray-200 text-left">Habit</th>
              {daysArray.map((d) => (
                <th key={d} className="p-1 border border-gray-200 text-center w-8">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const monthData =
                habit.progress[currentYear]?.[currentMonth] ||
                initializeHabitDays(currentYear, currentMonth);
              return (
                <tr key={habit.id} className="border-t border-gray-200">
                  <td className="p-2 font-medium text-gray-700 border border-gray-200">
                    {habit.name}
                  </td>
                  {daysArray.map((d) => (
                    <td
                      key={d}
                      onClick={() => toggleHabitDay(habit.id, d)}
                      className={`cursor-pointer p-2 text-center border border-gray-200 transition-all ${
                        monthData[d] === "complete"
                          ? "bg-emerald-400 hover:bg-emerald-500 text-white"
                          : monthData[d] === "partial"
                          ? "bg-amber-300 hover:bg-amber-400 text-white"
                          : "bg-rose-100 hover:bg-rose-200"
                      }`}
                    >
                      {monthData[d] === "complete"
                        ? "✓"
                        : monthData[d] === "partial"
                        ? "•"
                        : ""}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Popup for adding habit */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Habit
            </h2>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="border border-gray-300 rounded-md w-full p-2 mb-4"
              placeholder="Habit name"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={addHabit}
                className="px-3 py-1 rounded-md bg-pink-500 text-white hover:bg-pink-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;