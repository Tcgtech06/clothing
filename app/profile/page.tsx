'use client';

import { User, Mail, Phone, MapPin, Edit2, Camera } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main Street, New York, NY 10001',
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-primary text-3xl font-bold">
                  {profile.name.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 bg-white text-primary p-2 rounded-full shadow-lg hover:bg-gray-100 transition">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-2xl font-bold mt-4">{profile.name}</h2>
              <p className="text-white/80">{profile.email}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-gray-800">{profile.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-gray-800">{profile.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-gray-800">{profile.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.address}
                    onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />
                ) : (
                  <p className="text-lg text-gray-800">{profile.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-primary">12</p>
            <p className="text-gray-600 mt-1">Total Orders</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-green-600">$1,234</p>
            <p className="text-gray-600 mt-1">Total Spent</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-orange-600">2,450</p>
            <p className="text-gray-600 mt-1">Loyalty Points</p>
          </div>
        </div>
      </div>
    </div>
  );
}
