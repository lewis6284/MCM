import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api";
import { Search, Calendar, User, FileText, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const HospitalDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, COMPLETED

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Fetch all bookings for the logged-in hospital
        const response = await api.get("/bookings");
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.Candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.Candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.Candidate.passport_uid.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "ALL") return matchesSearch;
    return matchesSearch && booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED": return "bg-blue-100 text-blue-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hospital Dashboard</h1>
            <p className="text-gray-500">Manage medical examination appointments</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "ALL" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("PENDING")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "PENDING" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "COMPLETED" ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
            >
              Completed
            </button>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, passport, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading appointments...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No appointments found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-gray-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{booking.Candidate.first_name} {booking.Candidate.last_name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <FileText size={14} /> {booking.reference_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-mono bg-gray-100 px-1 rounded text-xs">PASS: {booking.Candidate.passport_uid}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {new Date(booking.appointment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>

                  {booking.status !== "COMPLETED" && booking.status !== "CANCELLED" ? (
                    <Link
                      to={`/medical-reports?passport=${booking.Candidate.passport_uid}`}
                      className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      Start Exam
                    </Link>
                  ) : (
                    <Link
                      to={`/medical-reports?passport=${booking.Candidate.passport_uid}&mode=view`}
                      className="ml-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      View Report
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HospitalDashboardPage;
