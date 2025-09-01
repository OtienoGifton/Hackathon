import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/supabase";
import { Heart, MapPin, Clock, User, Phone, Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

function Requests() {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    description: "",
    food_type: "",
    quantity_needed: "",
    urgency_level: "medium",
    location: "",
    notes: ""
  });

  useEffect(() => {
    fetchRequests();
    if (userProfile?.role === 'beneficiary') {
      fetchUserRequests();
    }
  }, [userProfile]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await db.getRequests();
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRequests = async () => {
    try {
      const data = await db.getRequestsByUser(userProfile.id);
      setUserRequests(data || []);
    } catch (error) {
      console.error("Error fetching user requests:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error("Please provide a description of the food needed");
      return;
    }

    try {
      const requestData = {
        user_id: userProfile.id,
        description: formData.description,
        food_type: formData.food_type,
        quantity_needed: formData.quantity_needed ? parseInt(formData.quantity_needed) : null,
        urgency_level: formData.urgency_level,
        location: formData.location,
        notes: formData.notes
      };

      if (editingRequest) {
        // Update existing request
        await db.updateRequest(editingRequest.id, requestData);
        toast.success("Request updated successfully");
        setEditingRequest(null);
      } else {
        // Create new request
        await db.createRequest(requestData);
        toast.success("Food request created successfully");
      }

      // Reset form and refresh data
      setFormData({
        description: "",
        food_type: "",
        quantity_needed: "",
        urgency_level: "medium",
        location: "",
        notes: ""
      });
      setShowCreateForm(false);
      fetchRequests();
      fetchUserRequests();
    } catch (error) {
      console.error("Error saving request:", error);
      toast.error("Failed to save request");
    }
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setFormData({
      description: request.description,
      food_type: request.food_type || "",
      quantity_needed: request.quantity_needed?.toString() || "",
      urgency_level: request.urgency_level || "medium",
      location: request.location || "",
      notes: request.notes || ""
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (requestId) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await db.deleteRequest(requestId);
        toast.success("Request deleted successfully");
        fetchRequests();
        fetchUserRequests();
      } catch (error) {
        console.error("Error deleting request:", error);
        toast.error("Failed to delete request");
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingRequest(null);
    setFormData({
      description: "",
      food_type: "",
      quantity_needed: "",
      urgency_level: "medium",
      location: "",
      notes: ""
    });
  };

  const filteredRequests = requests.filter(request => {
    if (filter === "all") return true;
    return request.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Food Requests</h1>
        <p className="text-gray-600">
          {userProfile?.role === 'beneficiary' 
            ? "Create food requests and track their status"
            : "View food requests from people in need"
          }
        </p>
      </div>

      {/* Create Request Button for Beneficiaries */}
      {userProfile?.role === 'beneficiary' && (
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Request</span>
          </button>
        </div>
      )}

      {/* Create/Edit Request Form */}
      {showCreateForm && (
        <div className="mb-8 card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingRequest ? "Edit Food Request" : "Create New Food Request"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the type of food assistance needed..."
                  className="input-field"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Type
                </label>
                <input
                  type="text"
                  value={formData.food_type}
                  onChange={(e) => setFormData({...formData, food_type: e.target.value})}
                  placeholder="e.g., Rice, Vegetables, Protein..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Needed
                </label>
                <input
                  type="number"
                  value={formData.quantity_needed}
                  onChange={(e) => setFormData({...formData, quantity_needed: e.target.value})}
                  placeholder="Number of people or meals"
                  className="input-field"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  value={formData.urgency_level}
                  onChange={(e) => setFormData({...formData, urgency_level: e.target.value})}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Your location or pickup area"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional information..."
                  className="input-field"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="btn-primary"
              >
                {editingRequest ? "Update Request" : "Create Request"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User's Own Requests (for beneficiaries) */}
      {userProfile?.role === 'beneficiary' && userRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Requests</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {request.users?.name || "You"}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : request.status === "approved"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {request.food_type || "Food Assistance"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {request.description}
                    </p>
                  </div>

                  {request.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{request.location}</span>
                    </div>
                  )}

                  {request.quantity_needed && (
                    <div className="text-sm text-gray-500">
                      Quantity: {request.quantity_needed}
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Urgency: {request.urgency_level.charAt(0).toUpperCase() + request.urgency_level.slice(1)}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(request)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Edit className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-400">
                  Created: {new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Requests Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">All Food Requests</h2>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "approved"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("fulfilled")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "fulfilled"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Fulfilled
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              {filter === "all" 
                ? "There are no food requests at the moment."
                : `No ${filter} requests found.`
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {request.users?.name || "Anonymous"}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "approved"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {request.food_type || "Food Assistance"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {request.description}
                  </p>
                </div>

                {request.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{request.location}</span>
                  </div>
                )}

                {request.quantity_needed && (
                  <div className="text-sm text-gray-500">
                    Quantity: {request.quantity_needed}
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  Urgency: {request.urgency_level?.charAt(0).toUpperCase() + request.urgency_level?.slice(1) || "Medium"}
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-400">
                Requested on: {new Date(request.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Requests;
