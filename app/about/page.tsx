'use client';

import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowLeft, Users, Shield, Award, Clock } from "lucide-react";
import { useState, useEffect } from "react";

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [titleText, setTitleText] = useState("");

  const fullTitle = "About LifeLink";

  useEffect(() => {
    setIsVisible(true);

    // Typewriter effect for title
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullTitle.length) {
        setTitleText(fullTitle.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Patient-Centered Care",
      description: "We put patients at the heart of everything we do, ensuring accessible, quality healthcare for all Jamaicans."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is protected with enterprise-grade encryption and HIPAA-compliant infrastructure."
    },
    {
      icon: Award,
      title: "Licensed Professionals",
      description: "Connect with verified, licensed healthcare providers across multiple specialties."
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Access healthcare whenever you need it with our instant consultation feature."
    }
  ];

  const stats = [
    { number: "5K+", label: "Active Patients" },
    { number: "100+", label: "Healthcare Providers" },
    { number: "50K+", label: "Consultations" },
    { number: "4.9", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen light" style={{ backgroundColor: 'hsl(150, 15%, 95%)', color: '#1a1a1a' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                LifeLink
              </span>
            </Link>

            {/* Back to Home */}
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-800 text-white font-semibold text-sm hover:bg-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Title with Typewriter Effect */}
          <div
            className="text-center mb-16"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.7s ease-out'
            }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              {titleText}
              <span className="animate-pulse">|</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing healthcare access in Jamaica through innovative telemedicine solutions
            </p>
          </div>

          {/* Mission Section */}
          <div
            className="bg-white rounded-3xl p-8 lg:p-12 mb-12 shadow-lg"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 0.8s ease-out 0.2s'
            }}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-4">
                  LifeLink is dedicated to breaking down barriers to healthcare access across Jamaica.
                  We believe that quality medical care should be available to everyone, regardless of
                  location or time constraints.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Through our advanced telemedicine platform, we connect patients with licensed healthcare
                  professionals, providing instant consultations, scheduled appointments, and comprehensive
                  health management tools—all from the comfort of your home.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/assets/doc-2.png"
                  alt="Healthcare professional"
                  width={500}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.8s ease-out 0.4s'
            }}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-white rounded-3xl p-6 text-center shadow-md"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.6s ease-out ${0.5 + index * 0.1}s`
                }}
              >
                <div className="text-4xl lg:text-5xl font-bold text-orange-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2
              className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-12"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.7s ease-out 0.6s'
              }}
            >
              Why Choose LifeLink?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `all 0.6s ease-out ${0.7 + index * 0.1}s`
                  }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sagicor Partnership Section */}
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 lg:p-12 text-white text-center shadow-xl"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 0.8s ease-out 1s'
            }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Built for the Sagicor Innovation Challenge 2026
            </h2>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
              LifeLink is our solution to revolutionize healthcare delivery in Jamaica,
              combining cutting-edge technology with compassionate care to serve communities
              across the island.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-10 py-4 rounded-full bg-white text-blue-600 font-semibold text-lg hover:bg-gray-100 transition-all"
              >
                Get Started Today
              </Link>
              <Link
                href="/"
                className="px-10 py-4 rounded-full bg-transparent border-2 border-white text-white font-semibold text-lg hover:bg-white/10 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                <Heart className="w-4 h-4 text-gray-900" fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-white">LifeLink</span>
            </div>
            <div className="text-center text-sm">
              © 2026 LifeLink. Built for Sagicor Innovation Challenge
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
