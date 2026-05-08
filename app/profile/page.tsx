'use client';

import { User, Mail, Phone, MapPin, Edit2, Camera, Package, Award, ChevronRight, Plus, Trash2, Check, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

// Gender Icons - Realistic Avatar Style
const MaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="50" cy="50" r="50" fill="#E8F4F8"/>
    {/* Face */}
    <circle cx="50" cy="40" r="18" fill="#D4A574"/>
    {/* Hair */}
    <path d="M32 32 Q32 20 40 18 Q45 15 50 15 Q55 15 60 18 Q68 20 68 32 L68 38 Q68 40 66 40 L34 40 Q32 40 32 38 Z" fill="#2C3E50"/>
    {/* Eyebrows */}
    <path d="M40 36 Q42 35 44 36" stroke="#1A252F" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M56 36 Q58 35 60 36" stroke="#1A252F" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Eyes */}
    <circle cx="42" cy="40" r="2" fill="#2C3E50"/>
    <circle cx="58" cy="40" r="2" fill="#2C3E50"/>
    {/* Nose */}
    <path d="M50 44 L50 48" stroke="#B8956A" strokeWidth="1" strokeLinecap="round"/>
    {/* Smile */}
    <path d="M44 50 Q50 54 56 50" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Facial hair - goatee */}
    <ellipse cx="50" cy="54" rx="3" ry="2" fill="#2C3E50"/>
    {/* Neck */}
    <rect x="44" y="56" width="12" height="8" fill="#C49B6B" rx="2"/>
    {/* Shoulders - Blue shirt */}
    <path d="M30 64 Q30 62 32 62 L44 62 L44 100 L56 100 L56 62 L68 62 Q70 62 70 64 L70 100 L30 100 Z" fill="#3498DB"/>
    {/* Collar */}
    <path d="M44 62 L46 66 L50 64 L54 66 L56 62" stroke="#2980B9" strokeWidth="1.5" fill="none"/>
  </svg>
);

const FemaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="50" cy="50" r="50" fill="#FFF0F5"/>
    {/* Face */}
    <circle cx="50" cy="40" r="18" fill="#E8B4A0"/>
    {/* Hair - Long with bangs */}
    <path d="M32 28 Q32 18 38 15 Q44 12 50 12 Q56 12 62 15 Q68 18 68 28 L68 45 Q68 50 65 52 L60 48 L60 42 L40 42 L40 48 L35 52 Q32 50 32 45 Z" fill="#4A2C2A"/>
    {/* Bangs */}
    <path d="M35 28 Q38 24 42 24 Q46 22 50 22 Q54 22 58 24 Q62 24 65 28 L65 32 L35 32 Z" fill="#3A1F1F"/>
    {/* Eyebrows */}
    <path d="M40 36 Q42 35 44 36" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M56 36 Q58 35 60 36" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Eyes with lashes */}
    <circle cx="42" cy="40" r="2" fill="#2C3E50"/>
    <circle cx="58" cy="40" r="2" fill="#2C3E50"/>
    <path d="M40 38 L38 36" stroke="#2C1810" strokeWidth="1" strokeLinecap="round"/>
    <path d="M60 38 L62 36" stroke="#2C1810" strokeWidth="1" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M50 44 L50 47" stroke="#D4A089" strokeWidth="1" strokeLinecap="round"/>
    {/* Smile with lipstick */}
    <path d="M44 50 Q50 54 56 50" stroke="#C85A7C" strokeWidth="2" strokeLinecap="round" fill="none"/>
    {/* Neck */}
    <rect x="44" y="56" width="12" height="8" fill="#DDA790" rx="2"/>
    {/* Shoulders - Pink top */}
    <path d="M30 64 Q30 62 32 62 L44 62 L44 100 L56 100 L56 62 L68 62 Q70 62 70 64 L70 100 L30 100 Z" fill="#FF69B4"/>
    {/* Neckline detail */}
    <path d="M44 62 Q50 68 56 62" stroke="#FF1493" strokeWidth="1.5" fill="none"/>
  </svg>
);

const TransgenderIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="50" cy="50" r="50" fill="#F5F0FF"/>
    {/* Face */}
    <circle cx="50" cy="40" r="18" fill="#D9C4A8"/>
    {/* Hair - Modern asymmetric style */}
    <path d="M32 30 Q32 20 38 16 Q44 13 50 13 Q56 13 62 16 Q68 20 68 30 L68 40 Q68 42 66 42 L58 42 L58 38 L42 38 L42 42 L34 42 Q32 42 32 40 Z" fill="#6B4E9A"/>
    {/* Side swept bangs */}
    <path d="M32 30 Q35 26 40 25 Q45 24 50 24 L50 32 L35 32 Z" fill="#5A3D7F"/>
    {/* Eyebrows */}
    <path d="M40 36 Q42 35 44 36" stroke="#4A3560" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M56 36 Q58 35 60 36" stroke="#4A3560" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Eyes */}
    <circle cx="42" cy="40" r="2" fill="#2C3E50"/>
    <circle cx="58" cy="40" r="2" fill="#2C3E50"/>
    {/* Nose */}
    <path d="M50 44 L50 48" stroke="#C4B098" strokeWidth="1" strokeLinecap="round"/>
    {/* Smile */}
    <path d="M44 50 Q50 54 56 50" stroke="#8B6F9C" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Neck */}
    <rect x="44" y="56" width="12" height="8" fill="#CFBAA0" rx="2"/>
    {/* Shoulders - Purple shirt */}
    <path d="M30 64 Q30 62 32 62 L44 62 L44 100 L56 100 L56 62 L68 62 Q70 62 70 64 L70 100 L30 100 Z" fill="#9B59B6"/>
    {/* Collar V-neck */}
    <path d="M44 62 L50 68 L56 62" stroke="#7D3C98" strokeWidth="1.5" fill="none"/>
    {/* Transgender symbol badge */}
    <circle cx="70" cy="70" r="12" fill="#FFFFFF" opacity="0.95"/>
    <circle cx="70" cy="70" r="4" stroke="#9B59B6" strokeWidth="1.5" fill="none"/>
    <path d="M70 66 L70 62 M68 64 L72 64" stroke="#9B59B6" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M73 73 L76 76 M76 73 L73 76" stroke="#9B59B6" strokeWidth="1.5" strokeLinecap="round"/>
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
    upiId: '',
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
        upiId: userData.upiId || '',
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
        upiId: editedProfile.upiId,
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
                  Transgender
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

              {/* UPI ID */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 10 L22 10" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="7" cy="15" r="1" fill="currentColor"/>
                  </svg>
                  UPI ID (for refunds)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.upiId}
                    onChange={(e) => setEditedProfile({ ...editedProfile, upiId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="yourname@upi"
                  />
                ) : (
                  <p className="text-lg text-gray-800">{profile.upiId || 'Not provided'}</p>
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
