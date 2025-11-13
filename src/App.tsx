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
  const [newHabitName, setNewHabitName] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem("habitData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // ✅ Load habits from localStorage when app starts
  React.useEffect(() => {
    const saved = localStorage.getItem("habitData");
    if (saved) {
      try {
        setHabits(JSON.parse(saved));
      } catch {
        console.warn("Corrupt data in localStorage. Resetting...");
        setHabits([]);
      }
    }
  }, []);

  // ✅ Save habits to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem("habitData", JSON.stringify(habits));
  }, [habits]);

  React.useEffect(() => {
    localStorage.setItem("habitTrackerState", JSON.stringify({
      year: currentYear,
      month: currentMonth
    }));
  }, [currentYear, currentMonth]);

  React.useEffect(() => {
    const savedState = localStorage.getItem("habitTrackerState");
    if (savedState) {
      const { year, month } = JSON.parse(savedState);
      setCurrentYear(year);
      setCurrentMonth(month);
    }
  }, []);

  React.useEffect(() => {
    if (showPopup && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showPopup]);

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
          const yearData = habit.progress[currentYear] ?? {};
          const monthData = yearData[currentMonth] ?? {};
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
    const newMonth = currentMonth + 1;
    if (newMonth > 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(newMonth);
    }
  };

  const prevMonth = () => {
    const newMonth = currentMonth - 1;
    if (newMonth < 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(newMonth);
    }
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
                habit.progress[currentYear]?.[currentMonth] ??
                habit.progress[currentYear]?.[currentMonth] ??
                {};
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
                ref={inputRef}
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addHabit();
                }}
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



// import { useEffect, useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   Trash2,
// } from "lucide-react";

// type MonthProgress = Record<number, string>; // day -> "", "partial", "complete"

// type Habit = {
//   id: number;
//   name: string;
//   progress: {
//     [year: number]: {
//       [month: number]: MonthProgress;
//     };
//   };
// };

// // initialize empty days for a month (used on creation only)
// const initializeHabitDays = (year: number, month: number) => {
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const days: MonthProgress = {};
//   for (let d = 1; d <= daysInMonth; d++) days[d] = "";
//   return days;
// };

// const App: React.FC = () => {
//   // --- core state ---
//   const today = new Date();
//   const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
//   const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());

//   // load habits from localStorage on init (state initializer)
//   const [habits, setHabits] = useState<Habit[]>(() => {
//     const raw = localStorage.getItem("habitData");
//     if (!raw) return [];
//     try {
//       return JSON.parse(raw) as Habit[];
//     } catch {
//       return [];
//     }
//   });

//   const [newHabitName, setNewHabitName] = useState<string>("");
//   const [showPopup, setShowPopup] = useState<boolean>(false);

//   // --- delete-mode state ---
//   const [deleteMode, setDeleteMode] = useState<boolean>(false);
//   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
//   const [showConfirmDelete, setShowConfirmDelete] = useState(false);

//   // input ref for auto-focus in popup
//   const inputRef = useRef<HTMLInputElement | null>(null);

//   // persist habits whenever they change
//   useEffect(() => {
//     localStorage.setItem("habitData", JSON.stringify(habits));
//   }, [habits]);

//   // auto-focus input when popup opens
//   useEffect(() => {
//     if (showPopup && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [showPopup]);

//   // month helpers
//   const daysInMonth = useMemo(
//     () => new Date(currentYear, currentMonth + 1, 0).getDate(),
//     [currentYear, currentMonth]
//   );
//   const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

//   // ---------------------------
//   // Helper: get month data safely
//   const getMonthData = (habit: Habit, year: number, month: number): MonthProgress => {
//     return habit.progress?.[year]?.[month] ?? {};
//   };

//   // Helper: detect protected streak (>= 10 consecutive partial/complete)
//   const hasProtectedStreak = (monthData: MonthProgress): boolean => {
//     if (!monthData) return false;
//     let streak = 0;
//     for (let d = 1; d <= daysInMonth; d++) {
//       const v = monthData[d];
//       if (v === "partial" || v === "complete") {
//         streak++;
//         if (streak >= 10) return true;
//       } else {
//         streak = 0;
//       }
//     }
//     return false;
//   };

//   // Convenience: compute map of habitId -> protected boolean for current month
//   const protectedMap = useMemo(() => {
//     const map = new Map<number, boolean>();
//     for (const h of habits) {
//       const md = getMonthData(h, currentYear, currentMonth);
//       map.set(h.id, hasProtectedStreak(md));
//     }
//     return map;
//   }, [habits, currentYear, currentMonth, daysInMonth]);

//   // is any habit protected? used to disable Select All / Delete All
//   const anyProtected = useMemo(() => {
//     for (const v of protectedMap.values()) if (v) return true;
//     return false;
//   }, [protectedMap]);

//   // Keep selectedIds in sync: remove ids that became protected or no longer exist
//   useEffect(() => {
//     if (!selectedIds.size) return;
//     let changed = false;
//     const newSet = new Set<number>();
//     for (const id of selectedIds) {
//       // keep only if habit exists and is NOT protected in current month
//       const exists = habits.some((h) => h.id === id);
//       const isProtected = protectedMap.get(id) ?? false;
//       if (exists && !isProtected) newSet.add(id);
//       else changed = true;
//     }
//     if (changed) setSelectedIds(newSet);
//   }, [currentYear, currentMonth, habits, protectedMap]); // eslint-disable-line

//   // ---------------------------
//   // Add habit (creates days for current month only)
//   const addHabit = () => {
//     const name = newHabitName.trim();
//     if (!name) return;
//     const days = initializeHabitDays(currentYear, currentMonth);
//     const newHabit: Habit = {
//       id: Date.now(),
//       name,
//       progress: { [currentYear]: { [currentMonth]: days } },
//     };
//     setHabits((s) => [...s, newHabit]);
//     setNewHabitName("");
//     setShowPopup(false);
//   };

//   // 3-state toggle for day ("" -> "partial" -> "complete" -> "")
//   const toggleHabitDay = (habitId: number, day: number) => {
//     // prevent marking future days
//     const now = new Date();
//     const isFuture =
//       currentYear > now.getFullYear() ||
//       (currentYear === now.getFullYear() &&
//         (currentMonth > now.getMonth() || (currentMonth === now.getMonth() && day > now.getDate())));
//     if (isFuture) return;

//     setHabits((prev) =>
//       prev.map((h) => {
//         if (h.id !== habitId) return h;
//         const yearData = { ...(h.progress[currentYear] ?? {}) };
//         const monthData = { ...(yearData[currentMonth] ?? {}) };
//         const cur = monthData[day] ?? "";
//         const next = cur === "" ? "partial" : cur === "partial" ? "complete" : "";
//         monthData[day] = next;
//         return {
//           ...h,
//           progress: {
//             ...h.progress,
//             [currentYear]: { ...yearData, [currentMonth]: monthData },
//           },
//         };
//       })
//     );
//   };

//   // ---------------------------
//   // Delete-mode helpers
//   const toggleDeleteMode = () => {
//     setDeleteMode((s) => {
//       const newVal = !s;
//       if (!newVal) {
//         // exit delete mode -> clear selection
//         setSelectedIds(new Set());
//       }
//       return newVal;
//     });
//   };

//   const toggleSelect = (id: number) => {
//     if (protectedMap.get(id)) return; // can't select protected
//     setSelectedIds((prev) => {
//       const copy = new Set(prev);
//       if (copy.has(id)) copy.delete(id);
//       else copy.add(id);
//       return copy;
//     });
//   };

//   // Select All (only non-protected)
//   const handleSelectAll = (checked: boolean) => {
//     if (!checked) {
//       setSelectedIds(new Set());
//       return;
//     }
//     if (anyProtected) {
//       // disabled by requirement
//       return;
//     }
//     const newSet = new Set<number>();
//     for (const h of habits) {
//       const isProtected = protectedMap.get(h.id) ?? false;
//       if (!isProtected) newSet.add(h.id);
//     }
//     setSelectedIds(newSet);
//   };

//   // Delete selected with confirmation
//   const confirmDeleteSelected = () => {
//     if (selectedIds.size === 0) return;
//     setShowConfirmDelete(true);
//   };

//   const performDeleteSelected = () => {
//     if (selectedIds.size === 0) return;
//     setHabits((prev) => prev.filter((h) => !selectedIds.has(h.id)));
//     setSelectedIds(new Set());
//     setShowConfirmDelete(false);
//     setDeleteMode(false);
//   };

//   // Delete all (via select-all then delete) — but requirement: disabled if any protected
//   const handleDeleteAll = () => {
//     if (anyProtected) return;
//     // select all then confirm delete
//     const newSet = new Set<number>(habits.map((h) => h.id));
//     setSelectedIds(newSet);
//     setShowConfirmDelete(true);
//   };

//   // ---------------------------
//   // Month navigation (safe version that updates both without double increments)
//   const nextMonth = () => {
//     const newMonth = currentMonth + 1;
//     if (newMonth > 11) {
//       setCurrentMonth(0);
//       setCurrentYear((y) => y + 1);
//     } else {
//       setCurrentMonth(newMonth);
//     }
//     // clear selection on month change
//     setSelectedIds(new Set());
//     setDeleteMode(false);
//   };

//   const prevMonth = () => {
//     const newMonth = currentMonth - 1;
//     if (newMonth < 0) {
//       setCurrentMonth(11);
//       setCurrentYear((y) => y - 1);
//     } else {
//       setCurrentMonth(newMonth);
//     }
//     setSelectedIds(new Set());
//     setDeleteMode(false);
//   };

//   // ---------------------------
//   // UI helpers
//   const isHabitProtected = (id: number) => {
//     return protectedMap.get(id) ?? false;
//   };
//   const selectedCount = selectedIds.size;
//   const selectAllChecked = selectedCount > 0 && selectedCount === habits.filter(h => !(protectedMap.get(h.id))).length;

//   // --- markup ---
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* header: logo + title */}
//         <div className="flex items-center mb-6">
//           <img src="/HTIcon.jpg" alt="HTLogo" className="w-14 h-14 rounded-full mr-4 object-cover" />
//           <div>
//             <h1 className="text-3xl font-extrabold text-gray-900">Habit Tracker</h1>
//             <p className="text-gray-600">Track your habits and stay consistent!</p>
//           </div>
//         </div>

//         {/* month switcher + delete icon */}
//         <div className="flex items-center justify-center mb-6 relative">
//           {/* centered month switcher */}
//           <div className="flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 px-6 py-3 rounded-2xl shadow-md backdrop-blur-sm border border-gray-200 dark:border-gray-700">
//             <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" aria-label="Previous month">
//               <ChevronLeft size={20} className="text-gray-700 dark:text-gray-200" />
//             </button>

//             <div className="min-w-[200px] text-center">
//               <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
//                 {new Date(currentYear, currentMonth).toLocaleString(undefined, { month: "long", year: "numeric" })}
//               </div>
//             </div>

//             <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" aria-label="Next month">
//               <ChevronRight size={20} className="text-gray-700 dark:text-gray-200" />
//             </button>
//           </div>

//           {/* delete-mode toggle: top-right of the centered area */}
//           <div className="absolute right-4 top-0">
//             <button
//               onClick={toggleDeleteMode}
//               title={deleteMode ? "Exit delete mode" : "Delete habits"}
//               className={`p-2 rounded-md transition flex items-center gap-2 ${deleteMode ? "bg-red-100 text-red-700" : "bg-white/70 hover:bg-gray-100"}`}
//             >
//               <Trash2 size={18} />
//               <span className="hidden sm:block text-sm">{deleteMode ? "Cancel" : "Delete"}</span>
//             </button>
//           </div>
//         </div>

//         {/* habit table */}
//         <div className="overflow-x-auto bg-white shadow-lg rounded-2xl border border-gray-200">
//           <table className="min-w-full border-collapse text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 {/* DELETE MODE: checkbox column header */}
//                 {deleteMode && (
//                   <th className="p-2 border border-gray-200 text-center w-12">
//                     <input
//                       type="checkbox"
//                       onChange={(e) => handleSelectAll(e.target.checked)}
//                       checked={selectAllChecked}
//                       disabled={anyProtected}
//                       title={anyProtected ? "Some habits are protected this month — cannot select all" : "Select all"}
//                       aria-label="Select all habits"
//                     />
//                   </th>
//                 )}

//                 <th className="p-2 border border-gray-200 text-left">Habit</th>

//                 {daysArray.map((d) => (
//                   <th key={d} className="p-1 border border-gray-200 text-center w-8">
//                     {d}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {habits.length === 0 && (
//                 <tr>
//                   <td colSpan={(deleteMode ? 2 : 1) + daysArray.length} className="p-6 text-center text-gray-500">
//                     No habits yet — add one with the + button
//                   </td>
//                 </tr>
//               )}

//               {habits.map((habit) => {
//                 const monthData = getMonthData(habit, currentYear, currentMonth);
//                 const protectedThisMonth = isHabitProtected(habit.id);

//                 return (
//                   <tr key={habit.id} className="border-t border-gray-200 hover:bg-gray-50">
//                     {/* checkbox cell when in delete mode */}
//                     {deleteMode && (
//                       <td className="p-2 border border-gray-200 text-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedIds.has(habit.id)}
//                           onChange={() => toggleSelect(habit.id)}
//                           disabled={protectedThisMonth}
//                           title={protectedThisMonth ? "Cannot delete — protected due to 10+ day streak this month" : "Select to delete"}
//                           aria-label={`Select ${habit.name} for deletion`}
//                         />
//                       </td>
//                     )}

//                     <td className="p-2 font-medium text-gray-700 border border-gray-200">
//                       <div className="flex items-center gap-2">
//                         <span>{habit.name}</span>
//                         {protectedThisMonth && (
//                           <span className="ml-2 text-xs text-red-600 px-2 py-0.5 bg-red-50 rounded">Protected</span>
//                         )}
//                       </div>
//                     </td>

//                     {daysArray.map((d) => {
//                       const v = monthData[d] ?? "";
//                       const cellClass =
//                         v === "complete"
//                           ? "bg-emerald-400 hover:bg-emerald-500 text-white"
//                           : v === "partial"
//                           ? "bg-amber-300 hover:bg-amber-400 text-white"
//                           : "bg-rose-100 hover:bg-rose-200";
//                       return (
//                         <td
//                           key={d}
//                           onClick={() => toggleHabitDay(habit.id, d)}
//                           className={`cursor-pointer p-2 text-center border border-gray-200 transition-all ${cellClass}`}
//                         >
//                           {v === "complete" ? "✓" : v === "partial" ? "•" : ""}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* bottom confirmation bar for delete mode */}
//         <AnimatePresence>
//           {deleteMode && (
//             <motion.div
//               initial={{ y: 120, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 120, opacity: 0 }}
//               transition={{ type: "spring", stiffness: 120, damping: 18 }}
//               className="fixed left-0 right-0 bottom-0 flex justify-center pointer-events-auto"
//             >
//               <div className="max-w-4xl w-full mx-4 mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 flex items-center justify-between px-4 py-3">
//                 <div className="flex items-center gap-4">
//                   <div className="text-sm">
//                     {selectedCount} selected
//                     {anyProtected && (
//                       <span className="ml-3 text-xs text-red-600">Some habits are protected — cannot delete them</span>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={() => { setDeleteMode(false); setSelectedIds(new Set()); }}
//                     className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 transition"
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     onClick={confirmDeleteSelected}
//                     disabled={selectedCount === 0}
//                     className={`px-3 py-1 rounded-md text-white ${selectedCount === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
//                   >
//                     Delete Selected
//                   </button>

//                   <button
//                     onClick={handleDeleteAll}
//                     disabled={anyProtected || habits.length === 0}
//                     className={`px-3 py-1 rounded-md text-white ${anyProtected || habits.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
//                     title={anyProtected ? "Cannot delete all — at least one habit is protected this month" : "Delete all habits"}
//                   >
//                     Delete All
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Add button (FAB) - hidden when deleteMode is on */}
//         {!deleteMode && (
//           <motion.button
//             onClick={() => setShowPopup(true)}
//             className="fixed bottom-8 right-8 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white rounded-full p-4 shadow-2xl transition transform active:scale-95"
//             aria-label="Add Habit"
//             animate={{
//               scale: [1, 1.05, 1],
//               boxShadow: [
//                 "0 0 20px rgba(236, 72, 153, 0.2)",
//                 "0 0 40px rgba(217, 70, 239, 0.25)",
//                 "0 0 20px rgba(236, 72, 153, 0.2)",
//               ],
//             }}
//             transition={{
//               duration: 2,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           >
//             <Plus size={26} />
//           </motion.button>
//         )}

//         {/* Popup for adding habit */}
//         <AnimatePresence>
//           {showPopup && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-pink-100/70 via-purple-100/60 to-blue-100/70 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-gray-900/80 backdrop-blur-md z-50"
//             >
//               <motion.div
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 exit={{ scale: 0.9, opacity: 0 }}
//                 transition={{ type: "spring", stiffness: 120, damping: 12 }}
//                 className="relative bg-white/60 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700 rounded-2xl shadow-2xl p-8 w-[90%] max-w-sm text-center"
//               >
//                 <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition">
//                   <X size={22} />
//                 </button>

//                 <h2 className="text-2xl font-extrabold mb-2 text-gray-800 dark:text-white tracking-tight">Add New Habit</h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Build something great, one day at a time.</p>

//                 <motion.input
//                   ref={inputRef}
//                   type="text"
//                   value={newHabitName}
//                   onChange={(e) => setNewHabitName(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === "Enter") addHabit(); }}
//                   placeholder="e.g. Drink 2L water 💧"
//                   className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-700/50 focus:ring-2 focus:ring-pink-400 outline-none mb-6 text-gray-800 dark:text-gray-100"
//                   whileFocus={{ scale: 1.02 }}
//                 />

//                 <div className="flex justify-center gap-4">
//                   <motion.button onClick={() => setShowPopup(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition">
//                     Cancel
//                   </motion.button>

//                   <motion.button onClick={addHabit} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 transition">
//                     Add Habit
//                   </motion.button>
//                 </div>

//                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror" }} className="absolute inset-0 -z-10 bg-gradient-to-tr from-pink-300/40 via-purple-300/40 to-blue-300/40 blur-3xl rounded-3xl" />
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Confirmation modal */}
//         <AnimatePresence>
//           {showConfirmDelete && (
//             <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//               <motion.div className="bg-white rounded-xl p-6 shadow-xl w-80" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
//                 <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
//                 <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete {selectedCount} habit(s)? This cannot be undone for the current month.</p>
//                 <div className="flex justify-end gap-3">
//                   <button onClick={() => setShowConfirmDelete(false)} className="px-3 py-1 rounded-md bg-gray-200">Cancel</button>
//                   <button onClick={performDeleteSelected} className="px-3 py-1 rounded-md bg-red-600 text-white">Yes, delete</button>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }
// export default App;