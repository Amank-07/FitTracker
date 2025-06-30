import React, { useState, useEffect } from 'react';

const Profile = ({ user, updateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user.name || '',
    age: user.age || '',
    height: user.height || '',
    weight: user.weight || '',
    email: user.email || ''
  });

  useEffect(() => {
    setFormData({
      name: user.name || '',
      age: user.age || '',
      height: user.height || '',
      weight: user.weight || '',
      email: user.email || ''
    });
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setMessage('Please fill in name and email');
      return;
    }

    const updatedUser = {
      ...user,
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
      height: formData.height ? parseInt(formData.height) : null,
      weight: formData.weight ? parseInt(formData.weight) : null
    };

    updateUser(updatedUser);
    setIsEditing(false);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const updatedUser = {
          ...user,
          avatar: event.target.result
        };
        updateUser(updatedUser);
        setMessage('Avatar updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      age: user.age || '',
      height: user.height || '',
      weight: user.weight || '',
      email: user.email || ''
    });
  };

  const calculateBMI = () => {
    if (user.height && user.weight) {
      const heightInMeters = user.height / 100;
      const bmi = user.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(bmi) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          👤 Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'} mb-6`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            {/* Avatar Section */}
            <div className="mb-6">
              <div className="avatar-large mx-auto mb-4">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span>{user.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <span className="btn-secondary text-sm">
                  Change Avatar
                </span>
              </label>
            </div>

            {/* User Info */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {user.name}
                </h3>
                <p className="text-gray-600">{user.email}</p>
              </div>

              {user.age && (
                <div>
                  <span className="text-sm text-gray-600">Age:</span>
                  <span className="ml-2 font-medium">{user.age} years</span>
                </div>
              )}

              {user.height && (
                <div>
                  <span className="text-sm text-gray-600">Height:</span>
                  <span className="ml-2 font-medium">{user.height} cm</span>
                </div>
              )}

              {user.weight && (
                <div>
                  <span className="text-sm text-gray-600">Weight:</span>
                  <span className="ml-2 font-medium">{user.weight} kg</span>
                </div>
              )}

              {bmi && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">BMI</div>
                  <div className={`text-xl font-bold ${bmiInfo.color}`}>
                    {bmi}
                  </div>
                  <div className={`text-sm ${bmiInfo.color}`}>
                    {bmiInfo.category}
                  </div>
                </div>
              )}
            </div>

            {/* Edit Button */}
            <div className="mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary w-full"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">
              Personal Information
            </h2>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your age"
                      min="1"
                      max="120"
                    />
                  </div>

                  <div>
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your height"
                      min="100"
                      max="250"
                    />
                  </div>

                  <div>
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your weight"
                      min="30"
                      max="300"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-primary">
                    Save Changes
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
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Full Name</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {user.name || 'Not set'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Email</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {user.email || 'Not set'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Age</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {user.age ? `${user.age} years` : 'Not set'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Height</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {user.height ? `${user.height} cm` : 'Not set'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Weight</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {user.weight ? `${user.weight} kg` : 'Not set'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Stats */}
          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-6">Account Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Member Since</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {JSON.parse(localStorage.getItem(`workouts_${user.id}`) || '[]').length}
                </div>
                <div className="text-sm text-gray-600">Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {JSON.parse(localStorage.getItem(`meals_${user.id}`) || '[]').length}
                </div>
                <div className="text-sm text-gray-600">Meals Logged</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {JSON.parse(localStorage.getItem(`progress_${user.id}`) || '[]').length}
                </div>
                <div className="text-sm text-gray-600">Progress Logs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 