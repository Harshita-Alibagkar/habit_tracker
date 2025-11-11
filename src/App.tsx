import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, X } from "lucide-react";

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
      <div className="flex items-center mb-8">
        <img
          src="/HTIcon.jpg"
          alt="HTLogo"
          className="w-16 h-16 rounded-full mr-4 object-cover"
        />
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
        Habit Tracker
          </h1>
          <p className="text-gray-600">Track your habits and stay consistent!</p>
        </div>
      </div>
      <div className="flex justify-center items-center mb-8">
        {/* Month Switcher Card */}
        <div className="flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 px-6 py-3 rounded-2xl shadow-md backdrop-blur-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Previous month"
          >
            <ChevronLeft size={22} className="text-gray-700 dark:text-gray-200" />
          </button>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-wide min-w-[180px] text-center select-none">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h1>

          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Next month"
          >
            <ChevronRight size={22} className="text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        {/* Add Button */}
        <motion.button
          onClick={() => setShowPopup(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white rounded-full p-4 shadow-2xl transition transform active:scale-95"
          aria-label="Add Habit"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 20px rgba(236, 72, 153, 0.3)",
              "0 0 40px rgba(217, 70, 239, 0.4)",
              "0 0 20px rgba(236, 72, 153, 0.3)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Plus size={28} className="drop-shadow-sm" />
        </motion.button>
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
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-pink-100/70 via-purple-100/60 to-blue-100/70 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-gray-900/80 backdrop-blur-md z-50"
          >
            {/* Animated Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 12 }}
              className="relative bg-white/60 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700 rounded-2xl shadow-2xl p-8 w-[90%] max-w-sm text-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition"
              >
                <X size={22} />
              </button>

              {/* Title */}
              <h2 className="text-2xl font-extrabold mb-2 text-gray-800 dark:text-white tracking-tight">
                Add New Habit 
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Build something great, one day at a time.
              </p>

              {/* Input */}
              <motion.input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g. Drink 2L water 💧"
                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-700/50 focus:ring-2 focus:ring-pink-400 outline-none mb-6 text-gray-800 dark:text-gray-100"
                whileFocus={{ scale: 1.02 }}
              />

              {/* Buttons */}
              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={() => setShowPopup(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </motion.button>

                <motion.button
                  onClick={addHabit}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 transition"
                >
                  Add Habit
                </motion.button>
              </div>

              {/* Decorative Glow Ring */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror" }}
                className="absolute inset-0 -z-10 bg-gradient-to-tr from-pink-300/40 via-purple-300/40 to-blue-300/40 blur-3xl rounded-3xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;