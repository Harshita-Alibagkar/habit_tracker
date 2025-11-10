// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Plus, Moon, Sun } from "lucide-react";

// interface Habit {
//   id: number;
//   name: string;
//   days: Record<number, string>; // "partial" | "complete" | ""
// }

// const daysInMonth = (year: number, month: number): number =>
//   new Date(year, month + 1, 0).getDate();

// export default function App() {
//   const [habits, setHabits] = useState<Habit[]>(() => {
//     const stored = localStorage.getItem("habits");
//     if (!stored) return [];
//     try {
//       const parsed = JSON.parse(stored);
//       return parsed.map((h: any) => ({
//         ...h,
//         days: h.days || {},
//       }));
//     } catch {
//       return [];
//     }
//   });

//   const [showPopup, setShowPopup] = useState(false);
//   const [newHabit, setNewHabit] = useState("");
//   const [darkMode, setDarkMode] = useState<boolean>(() => {
//     return localStorage.getItem("theme") === "dark";
//   });
//   const [selectedMonth, setSelectedMonth] = useState<number>(
//     new Date().getMonth()
//   );
//   const [selectedYear, setSelectedYear] = useState<number>(
//     new Date().getFullYear()
//   );

//   const currentDate = new Date();

//   useEffect(() => {
//     localStorage.setItem("habits", JSON.stringify(habits));
//   }, [habits]);

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//     localStorage.setItem("theme", darkMode ? "dark" : "light");
//   }, [darkMode]);

//   const totalDays = daysInMonth(selectedYear, selectedMonth);
//   const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

//   const initializeHabitDays = (year: number, month: number) => {
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     const days: Record<number, string> = {};
//     for (let d = 1; d <= daysInMonth; d++) {
//       days[d] = "";
//     }
//     return days;
//   };

//   const toggleHabitDay = (habitId: number, day: number) => {
//     const today = new Date();
//     const isFuture =
//       selectedYear > today.getFullYear() ||
//       (selectedYear === today.getFullYear() &&
//         (selectedMonth > today.getMonth() ||
//           (selectedMonth === today.getMonth() && day > today.getDate())));
//     if (isFuture) return;

//     setHabits((prev) =>
//       prev.map((habit) => {
//         if (habit.id === habitId) {
//           const current = habit.days[day] || "";
//           const next =
//             current === ""
//               ? "partial"
//               : current === "partial"
//               ? "complete"
//               : "";
//           return {
//             ...habit,
//             days: { ...habit.days, [day]: next },
//           };
//         }
//         return habit;
//       })
//     );
//   };

//   const addHabit = () => {
//     if (!newHabit.trim()) return;
//     setHabits([
//       ...habits,
//       { id: Date.now(), name: newHabit, days: {}, },
//     ]);
//     setNewHabit("");
//     setShowPopup(false);
//   };

//   const calculateStreak = (habit: Habit): number => {
//     let streak = 0;
//     const days = habit.days || {};

//     for (let i = totalDays; i > 0; i--) {
//       if (days[i] === "complete") streak++;
//       else break;
//     }
//     return streak;
//   };

//   const getMotivation = (streak: number): string => {
//     if (streak === 3) return "✨ 3-day streak! Keep it up!";
//     if (streak === 7) return "🔥 7-day streak! You are on fire!";
//     if (streak === 30) return "🏆 You crushed this month!";
//     return "";
//   };

//   const prevMonth = () => {
//     if (selectedMonth === 0) {
//       setSelectedYear(selectedYear - 1);
//       setSelectedMonth(11);
//     } else setSelectedMonth(selectedMonth - 1);
//   };

//   const nextMonth = () => {
//     if (
//       selectedYear < currentDate.getFullYear() ||
//       (selectedYear === currentDate.getFullYear() &&
//         selectedMonth < currentDate.getMonth())
//     ) {
//       if (selectedMonth === 11) {
//         setSelectedYear(selectedYear + 1);
//         setSelectedMonth(0);
//       } else setSelectedMonth(selectedMonth + 1);
//     }
//   };

//   const completionPercentage = (habit: Habit): number => {
//     const completed = Object.values(habit.days).filter(
//       (v) => v === "complete"
//     ).length;
//     return Math.round((completed / totalDays) * 100);
//   };

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-rose-100 via-sky-100 to-lime-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 p-4">
//       <div className="max-w-6xl mx-auto flex flex-col items-center">
//         {/* Header */}
//         <div className="flex justify-between items-center w-full mb-6">
//           <h1 className="text-3xl font-bold tracking-wide">🌸 Habit Tracker</h1>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setDarkMode(!darkMode)}
//               className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
//             >
//               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//             </button>
//             <button
//               onClick={() => setShowPopup(true)}
//               className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-3"
//             >
//               <Plus size={20} />
//             </button>
//           </div>
//         </div>

//         {/* Month Switcher */}
//         <div className="flex items-center gap-4 mb-6">
//           <button
//             onClick={prevMonth}
//             className="bg-gray-300 dark:bg-gray-700 rounded-lg px-3 py-1"
//           >
//             ◀
//           </button>
//           <h2 className="text-xl font-semibold">
//             {new Date(selectedYear, selectedMonth).toLocaleString("default", {
//               month: "long",
//               year: "numeric",
//             })}
//           </h2>
//           <button
//             onClick={nextMonth}
//             className="bg-gray-300 dark:bg-gray-700 rounded-lg px-3 py-1"
//           >
//             ▶
//           </button>
//         </div>

//         {/* Habits Table */}
//         <div className="w-full overflow-x-auto mt-6">
//           <table className="min-w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-800">
//             <thead className="sticky top-0 bg-pink-200/70 dark:bg-gray-700">
//               <tr>
//                 <th className="p-3 text-left font-semibold border-b border-gray-200">
//                   Habit
//                 </th>
//                 {daysArray.map((d) => (
//                   <th
//                     key={d}
//                     className="p-2 text-center border-b border-gray-200 text-sm"
//                   >
//                     {d}
//                   </th>
//                 ))}
//                 <th className="p-2 text-center border-b border-gray-200">🔥</th>
//               </tr>
//             </thead>

//             <tbody>
//               {habits.map((habit) => {
//                 const streak = calculateStreak(habit);
//                 const motivation = getMotivation(streak);
//                 const progress = completionPercentage(habit);

//                 const getRowColor = (progress: number) => {
//                   if (progress === 100) return "bg-emerald-100";
//                   if (progress >= 30) return "bg-amber-100";
//                   return "bg-rose-100";
//                 };

//                 return (
//                   <tr
//                     key={habit.id}
//                     className={`${getRowColor(
//                       progress
//                     )} border-b border-gray-200 dark:border-gray-700 transition-colors`}
//                   >
//                     <td className="p-3 font-medium border-r border-gray-200">
//                       <div className="flex flex-col">
//                         <span>{habit.name}</span>
//                         <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded-full mt-1">
//                           <div
//                             className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
//                             style={{ width: `${progress}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                     </td>

//                     {/* ✅ Updated cells with 3-state logic */}
//                     {daysArray.map((d) => (
//                       <td
//                         key={d}
//                         onClick={() => toggleHabitDay(habit.id, d)}
//                         className={`cursor-pointer p-2 text-center border border-gray-200 transition-all 
//                           ${
//                             habit.days[d] === "complete"
//                               ? "bg-emerald-400 hover:bg-emerald-500 text-white"
//                               : habit.days[d] === "partial"
//                               ? "bg-amber-300 hover:bg-amber-400 text-white"
//                               : "bg-rose-100 hover:bg-rose-200 dark:bg-gray-700 dark:hover:bg-gray-600"
//                           }`}
//                       >
//                         {habit.days[d] === "complete"
//                           ? "✓"
//                           : habit.days[d] === "partial"
//                           ? "•"
//                           : ""}
//                       </td>
//                     ))}

//                     <td className="text-center font-bold text-orange-500 border-l border-gray-200">
//                       {streak}
//                       {motivation && (
//                         <motion.div
//                           className="text-xs text-pink-500 mt-1"
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                         >
//                           {motivation}
//                         </motion.div>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Add Habit Popup */}
//         <AnimatePresence>
//           {showPopup && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm"
//             >
//               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-80 text-center">
//                 <h3 className="text-xl font-semibold mb-4">Add New Habit</h3>
//                 <input
//                   type="text"
//                   value={newHabit}
//                   onChange={(e) => setNewHabit(e.target.value)}
//                   className="w-full p-2 mb-4 border dark:border-gray-600 rounded-lg"
//                   placeholder="e.g. Drink Water"
//                 />
//                 <div className="flex justify-end gap-2">
//                   <button
//                     onClick={() => setShowPopup(false)}
//                     className="bg-gray-300 dark:bg-gray-700 px-3 py-1 rounded-lg"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={addHabit}
//                     className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-1 rounded-lg"
//                   >
//                     Add
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }




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