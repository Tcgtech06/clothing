'use client';

import { User, Mail, Phone, MapPin, Edit2, Camera, Package, Award, ChevronRight, Plus, Trash2, Check, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

// Gender Icons - Realistic and Professional
const MaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <circle cx="32" cy="16" r="10" fill="#3B82F6"/>
    {/* Neck */}
    <rect x="28" y="24" width="8" height="4" fill="#2563EB" rx="2"/>
    {/* Shoulders and torso */}
    <path d="M20 28 L20 32 Q20 34 22 34 L22 50 Q22 52 24 52 L28 52 L28 62 L36 62 L36 52 L40 52 Q42 52 42 50 L42 34 Q44 34 44 32 L44 28 Q44 28 42 28 L38 28 L38 32 L26 32 L26 28 L22 28 Q20 28 20 28 Z" fill="#60A5FA"/>
    {/* Arms */}
    <rect x="16" y="30" width="6" height="18" fill="#3B82F6" rx="3"/>
    <rect x="42" y="30" width="6" height="18" fill="#3B82F6" rx="3"/>
  </svg>
);

const FemaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <circle cx="32" cy="16" r="10" fill="#EC4899"/>
    {/* Hair */}
    <path d="M22 12 Q22 8 26 8 Q28 6 32 6 Q36 6 38 8 Q42 8 42 12 L42 18 Q42 20 40 20 L24 20 Q22 20 22 18 Z" fill="#BE185D"/>
    {/* Neck */}
    <rect x="28" y="24" width="8" height="4" fill="#DB2777" rx="2"/>
    {/* Dress/Body */}
    <path d="M24 28 L24 32 Q24 34 26 34 L26 50 Q26 52 28 52 L28 62 L36 62 L36 52 Q38 52 38 50 L38 34 Q40 34 40 32 L40 28 Q40 28 38 30 L36 32 L36 48 L28 48 L28 32 L26 30 Q24 28 24 28 Z" fill="#F472B6"/>
    {/* Dress skirt */}
    <path d="M26 48 L22 58 Q22 60 24 60 L40 60 Q42 60 42 58 L38 48 Z" fill="#FBCFE8"/>
  </svg>
);

const TransgenderIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <circle cx="32" cy="16" r="10" fill="#8B5CF6"/>
    {/* Neck */}
    <rect x="28" y="24" width="8" height="4" fill="#7C3AED" rx="2"/>
    {/* Body - Neutral style */}
    <path d="M22 28 L22 32 Q22 34 24 34 L24 50 Q24 52 26 52 L28 52 L28 62 L36 62 L36 52 L38 52 Q40 52 40 50 L40 34 Q42 34 42 32 L42 28 Q42 28 40 28 L38 28 L38 48 L26 48 L26 28 L24 28 Q22 28 22 28 Z" fill="#A78BFA"/>
    {/* Transgender symbol overlay */}
    <circle cx="48" cy="48" r="8" fill="#FFFFFF" opacity="0.9"/>
    <path d="M48 44 L48 52 M44 48 L52 48 M46 46 L50 50 M50 46 L46 50" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

function ProfilePageContent() {
  const { user, userData, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'transgender' | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [editedProfile, setEditedProfile] = useState(profile);
  
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Initialize profile from userData
  useEffect(() => {
    if (userData) {
      const initialProfile = {
        name: userData.displayName || '',
        email: userData.email || '',
        phone: userData.phone || '',
      };
      setProfile(initialProfile);
      setEditedProfile(initialProfile);
      setSelectedGender(userData.gender || null);
      setLoyaltyPoints(userData.loyaltyPoints || 0);
    }
  }, [userData]);

  // Load user data from Firebase
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;
      
      try {
        // Load gender and loyalty points
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setSelectedGender(data.gender || null);
          setLoyaltyPoints(data.loyaltyPoints || 0);
        }
        
        // Load addresses
        const addressesSnapshot = await getDocs(
          collection(db, 'users', user.uid, 'addresses')
        );
        const loadedAddresses: Address[] = [];
        addressesSnapshot.forEach((doc) => {
          loadedAddresses.push({ id: doc.id, ...doc.data() } as Address);
        });
        setAddresses(loadedAddresses);
        
        // Load total orders - query by customerEmail
        const ordersQuery = query(
          collection(db, 'orders'),
          where('customerEmail', '==', user.email)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        setTotalOrders(ordersSnapshot.size);
        
        console.log('Loaded user data:', {
          gender: userDoc.exists() ? userDoc.data().gender : null,
          loyaltyPoints: userDoc.exists() ? userDoc.data().loyaltyPoints : 0,
          addresses: loadedAddresses.length,
          totalOrders: ordersSnapshot.size,
          userEmail: user.email
        });
        
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName: editedProfile.name,
        email: editedProfile.email,
        phone: editedProfile.phone,
        gender: selectedGender,
        loyaltyPoints: loyaltyPoints,
        updatedAt: new Date(),
      }, { merge: true });
      
      setProfile(editedProfile);
      setIsEditing(false);
      
      // Refresh user data in auth context
      await refreshUserData();
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleGenderSelect = async (gender: 'male' | 'female' | 'transgender') => {
    if (!user?.uid) return;
    
    setSelectedGender(gender);
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        gender: gender,
        updatedAt: new Date(),
      }, { merge: true });
      
      // Refresh user data in auth context
      await refreshUserData();
      
      console.log('Gender updated:', gender);
    } catch (error) {
      console.error('Error saving gender:', error);
    }
  };

  const handleSaveAddress = async () => {
    if (!user?.uid) return;
    
    // Validation
    if (!addressForm.name || !addressForm.phone || !addressForm.address || 
        !addressForm.city || !addressForm.state || !addressForm.pincode) {
      alert('Please fill all address fields');
      return;
    }
    
    try {
      if (editingAddressId) {
        // Update existing address
        await setDoc(doc(db, 'users', user.uid, 'addresses', editingAddressId), addressForm);
        setAddresses(addresses.map(addr => 
          addr.id === editingAddressId ? { ...addressForm, id: editingAddressId } : addr
        ));
      } else {
        // Add new address
        const newAddressRef = doc(collection(db, 'users', user.uid, 'addresses'));
        await setDoc(newAddressRef, addressForm);
        setAddresses([...addresses, { ...addressForm, id: newAddressRef.id }]);
      }
      
      // Reset form
      setAddressForm({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
      });
      setShowAddressForm(false);
      setEditingAddressId(null);
      alert(editingAddressId ? 'Address updated successfully!' : 'Address added successfully!');
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user?.uid) return;
    
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'addresses', addressId));
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with Avatar and Gender Selection */}
          <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                  {selectedGender === 'male' ? (
                    <MaleIcon className="w-20 h-20" />
                  ) : selectedGender === 'female' ? (
                    <FemaleIcon className="w-20 h-20" />
                  ) : selectedGender === 'transgender' ? (
                    <TransgenderIcon className="w-20 h-20" />
                  ) : (
                    <div className="text-primary text-3xl font-bold">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Gender Selection */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleGenderSelect('male')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    selectedGender === 'male'
                      ? 'bg-white text-primary font-semibold shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <MaleIcon className="w-5 h-5" />
                  Male
                </button>
                <button
                  onClick={() => handleGenderSelect('female')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    selectedGender === 'female'
                      ? 'bg-white text-primary font-semibold shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <FemaleIcon className="w-5 h-5" />
                  Female
                </button>
                <button
                  onClick={() => handleGenderSelect('transgender')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    selectedGender === 'transgender'
                      ? 'bg-white text-primary font-semibold shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <TransgenderIcon className="w-5 h-5" />
                  Other
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
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
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
                  <p className="text-lg text-gray-800">{profile.phone || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Saved Addresses
            </h3>
            <button
              onClick={() => {
                setAddressForm({
                  name: '',
                  phone: '',
                  address: '',
                  city: '',
                  state: '',
                  pincode: '',
                });
                setEditingAddressId(null);
                setShowAddressForm(true);
              }}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-primary/20">
              <h4 className="font-semibold text-gray-800 mb-3">
                {editingAddressId ? 'Edit Address' : 'New Address'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={2}
                    placeholder="House No, Street, Area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Maharashtra"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="400001"
                  />
                </div>

                <div className="md:col-span-2 flex gap-3">
                  <button
                    onClick={handleSaveAddress}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-medium"
                  >
                    {editingAddressId ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                      setAddressForm({
                        name: '',
                        phone: '',
                        address: '',
                        city: '',
                        state: '',
                        pincode: '',
                      });
                    }}
                    className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 && !showAddressForm ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No saved addresses yet</p>
              <p className="text-sm">Add an address to use during checkout</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary/50 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{address.name}</p>
                      <p className="text-sm text-gray-600">{address.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="text-primary hover:text-primary/80 transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-500 hover:text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {address.address}, {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Package className="w-12 h-12 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-primary">{totalOrders}</p>
            <p className="text-gray-600 mt-1">Total Orders</p>
            <p className="text-xs text-gray-500 mt-2">
              {totalOrders === 0 ? 'Start shopping to see your orders' : 'View all your orders'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Award className="w-12 h-12 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">{loyaltyPoints}</p>
            <p className="text-gray-600 mt-1">Loyalty Points</p>
            <p className="text-xs text-gray-500 mt-2">
              {loyaltyPoints === 0 ? 'Earn points with every purchase' : 'Redeem your rewards'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Link href="/orders">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">My Orders</h3>
                    <p className="text-sm text-gray-600">View and track your orders</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-primary transition" />
              </div>
            </div>
          </Link>

          <Link href="/loyalty">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Loyalty Points</h3>
                    <p className="text-sm text-gray-600">Redeem your rewards</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-orange-600 transition" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
