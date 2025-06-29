import React, { useState } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BookOpen, Lightbulb, Eye, EyeOff, Loader2, Upload, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5MB.");
        return;
      }
      setError("");
      setProfileImage(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post("api/token/", {
        username: loginData.username,
        password: loginData.password,
      });

      localStorage.setItem(ACCESS_TOKEN, response.data.access);
      localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.detail || 
        "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords don't match.");
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", registerData.username);
      formData.append("email", registerData.email);
      formData.append("password", registerData.password);
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      await api.post("api/user/register/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Account created successfully! You can now sign in.");
      setRegisterData({ username: '', email: '', password: '', confirmPassword: '' });
      setProfileImage(null);
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = "";
        
        if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`;
        } else {
          errorMessage = errorData.detail || "Registration failed. Please try again.";
        }
        
        setError(errorMessage);
      } else {
        setError("Registration failed. Please check your information and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-xl">
            <div className="relative">
              <BookOpen className="w-8 h-8 text-white" />
              <Lightbulb className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">StudyMaster</h1>
          <p className="text-gray-300">Learn Smarter, Not Harder</p>
        </div>

        {/* Login/Register Card */}
        <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700 shadow-2xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-slate-600">Login</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-slate-600">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-white text-2xl">Welcome Back</CardTitle>
                <CardDescription className="text-gray-400">
                  Sign in to access your study workspaces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300">Username or Email</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username or email"
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500"
                      autoComplete="username"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 pr-10"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link to="#" className="text-sm text-purple-400 hover:text-purple-300">
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-white text-2xl">Create Account</CardTitle>
                <CardDescription className="text-gray-400">
                  Join StudyMaster and start learning smarter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  {error && (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-900/50 border border-green-700 rounded-lg p-3">
                      <p className="text-green-300 text-sm">{success}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reg-username" className="text-gray-300">Username</Label>
                    <Input
                      id="reg-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500"
                      autoComplete="username"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-gray-300">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500"
                      autoComplete="email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 pr-10"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm-password" className="text-gray-300">Confirm Password</Label>
                    <Input
                      id="reg-confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-image" className="text-gray-300">
                      Profile Image (Optional)
                    </Label>
                    <div className="space-y-2">
                      {!profileImage ? (
                        <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-purple-500 transition-colors">
                          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-400 mb-2">
                            Click to upload a profile image
                          </p>
                          <Input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('profile-image').click()}
                            className="text-sm bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-600"
                          >
                            Choose Image
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-slate-700/50 rounded-lg">
                          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                            <img 
                              src={URL.createObjectURL(profileImage)} 
                              alt="Profile preview" 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          </div>
                          <span className="flex-1 text-sm text-gray-300 truncate">
                            {profileImage.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeImage}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            By continuing, you agree to our{' '}
            <Link to="#" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>
            {' '}and{' '}
            <Link to="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;