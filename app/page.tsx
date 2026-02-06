'use client';

import Image from "next/image";
import Link from "next/link";
import { PasskeyModal } from "@/components/PasskeyModal";
import { ArrowUpRight, Video, Calendar, Bot, Shield, Heart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const specialties = [
  { name: "Physiologist", hasIcon: true },
  { name: "Cardiologist", hasIcon: false },
  { name: "Specialist", hasIcon: true },
  { name: "Neurologist", color: "accent" },
];

const Home = ({ searchParams }: SearchParamProps) => {
  const isAdmin = searchParams?.admin === "true";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");

  const leftFullText = "YOUR HEALTH\nJOURNEY";
  const rightFullText = "AT YOUR\nFINGERTIPS";

  useEffect(() => {
    setIsVisible(true);

    // Typewriter effect for left text
    let leftIndex = 0;
    const leftInterval = setInterval(() => {
      if (leftIndex <= leftFullText.length) {
        setLeftText(leftFullText.slice(0, leftIndex));
        leftIndex++;
      } else {
        clearInterval(leftInterval);
      }
    }, 50);

    // Typewriter effect for right text (starts after a delay)
    const rightTimeout = setTimeout(() => {
      let rightIndex = 0;
      const rightInterval = setInterval(() => {
        if (rightIndex <= rightFullText.length) {
          setRightText(rightFullText.slice(0, rightIndex));
          rightIndex++;
        } else {
          clearInterval(rightInterval);
        }
      }, 50);
    }, 600);

    return () => {
      clearInterval(leftInterval);
      clearTimeout(rightTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen light" style={{ backgroundColor: 'hsl(150, 15%, 95%)', color: '#1a1a1a' }}>
      {isAdmin && <PasskeyModal />}

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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              <a href="#product" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Product
              </a>
              <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                About us
              </Link>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2 rounded-full bg-gray-800 text-white font-semibold text-sm hover:bg-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 rounded-full bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
              <a
                href="#product"
                className="block py-2 text-gray-900 font-medium hover:text-blue-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Product
              </a>
              <Link
                href="/about"
                className="block py-2 text-gray-900 font-medium hover:text-blue-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About us
              </Link>
              <div className="pt-4 space-y-3">
                <Link
                  href="/login"
                  className="block w-full px-6 py-2 rounded-full bg-gray-800 text-white text-center font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full px-6 py-2 rounded-full bg-blue-500 text-white text-center font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="relative min-h-screen pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="pt-12 lg:pt-16">
            {/* Large Split Typography */}
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12">
              {/* Left headline */}
              <div
                className="flex-1"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 0.7s ease-out'
                }}
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-[0.95] tracking-tight whitespace-pre-line">
                  {leftText}
                  <span className="animate-pulse">|</span>
                </h1>
              </div>

              {/* Center pill image */}
              <div
                className="hidden lg:flex items-center justify-center flex-shrink-0"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'scale(1)' : 'scale(0.8)',
                  transition: 'all 0.8s ease-out 0.2s'
                }}
              >
                <Image
                  src="/assets/pill-3d.png"
                  alt="Medical pill"
                  width={160}
                  height={160}
                  className="w-32 xl:w-40 h-auto animate-float"
                />
                <Image
                  src="/assets/pill-white.png"
                  alt="Medical tablet"
                  width={80}
                  height={80}
                  className="w-16 xl:w-20 h-auto -ml-4 animate-float-delayed"
                />
              </div>

              {/* Right headline */}
              <div
                className="flex-1 text-left lg:text-right"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 0.7s ease-out 0.1s'
                }}
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-[0.95] tracking-tight whitespace-pre-line">
                  {rightText}
                  <span className="animate-pulse">|</span>
                </h1>
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors"
                >
                  read more
                  <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </span>
                </a>
              </div>
            </div>

            {/* Doctor Selection & CTA Row */}
            <div className="flex flex-wrap items-center gap-6 mb-12">
              {/* Doctor avatar */}
              <div
                className="flex items-center gap-3"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'all 0.6s ease-out 0.4s'
                }}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image
                    src="/assets/doc-2.png"
                    alt="Doctor"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Choice your</p>
                  <p className="text-gray-600">doctor</p>
                </div>
              </div>

              {/* New Explore Button */}
              <div
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s ease-out 0.5s'
                }}
              >
                <Link
                  href="/register"
                  className="px-8 py-3 rounded-full bg-blue-500 text-white font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105 transform transition-all"
                >
                  New Explore
                </Link>
              </div>

              {/* Dot indicators */}
              <div className="hidden sm:flex items-center gap-2 ml-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              </div>
            </div>

            {/* Bottom Section - Specialists & Doctor Image */}
            <div className="grid lg:grid-cols-3 gap-8 pb-12">
              {/* Left - Specialists */}
              <div
                className="space-y-6"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 0.7s ease-out 0.6s'
                }}
              >
                <div>
                  <p className="text-sm text-gray-600 mb-2">We Provide</p>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    Only Highly Targeted
                    <br />
                    Specialists
                  </h2>
                </div>

                <Link
                  href="/register"
                  className="inline-block px-8 py-3 rounded-full bg-blue-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition-all"
                >
                  Request a Demo
                </Link>

                {/* Specialty tags */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {specialties.map((specialty, index) => (
                    <span
                      key={specialty.name}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border shadow-sm ${
                        specialty.color === 'accent'
                          ? 'bg-blue-100 border-blue-200'
                          : 'bg-white border-gray-200'
                      }`}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
                        transition: `all 0.5s ease-out ${0.7 + index * 0.1}s`
                      }}
                    >
                      {specialty.name}
                      {specialty.hasIcon && (
                        <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                          <ArrowUpRight className="w-3 h-3 text-blue-500" />
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Center - Doctor Image */}
              <div
                className="flex justify-center"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: 'all 0.8s ease-out 0.5s'
                }}
              >
                <div className="relative">
                  <div className="w-72 lg:w-80 xl:w-96 aspect-[3/4] rounded-3xl overflow-hidden bg-gray-200">
                    <Image
                      src="/assets/doc-2.png"
                      alt="Professional doctor"
                      width={384}
                      height={512}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              {/* Right - Telehealth Card */}
              <div
                className="hidden lg:block"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(30px)',
                  transition: 'all 0.7s ease-out 0.7s'
                }}
              >
                <TelehealthCard />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="product" className="py-20 lg:py-28" style={{ backgroundColor: 'hsl(150, 15%, 95%)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-2xl mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 mb-4">
              Platform Features
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              MODERN HEALTHCARE
              <br />
              <span className="text-gray-600">AT YOUR FINGERTIPS</span>
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Large feature card - Video Consultations */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-md group hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                    <Video className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    HD Video Consultations
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Crystal-clear video calls with screen sharing and recording.
                    Enterprise-grade infrastructure ensures reliable connections.
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:text-blue-500 transition-colors"
                  >
                    Learn more
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden bg-gray-100">
                  <Image
                    src="/assets/doc.jpg"
                    alt="Video consultation"
                    width={400}
                    height={300}
                    className="w-full h-48 lg:h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-gray-800 text-white rounded-3xl overflow-hidden shadow-md">
              <Image
                src="/assets/wait-time.jpeg"
                alt="Average wait time"
                width={400}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Appointment booking */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Easy Scheduling
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Browse available slots, choose your specialist, and book in seconds.
                Automated reminders keep you on track.
              </p>
            </div>

            {/* AI Health Assistant */}
            <div className="bg-blue-500 text-white rounded-3xl p-6 lg:p-8">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                AI Health Assistant
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                24/7 symptom analysis powered by Google Gemini. Get personalized
                health insights and recommendations anytime.
              </p>
            </div>

            {/* Security card with image */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-gray-900" />
                </div>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  HIPAA Compliant
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Secure & Private
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Enterprise-grade encryption protects your health data.
              </p>
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/assets/doctor-tablet.png"
                  alt="Secure platform"
                  width={300}
                  height={128}
                  className="w-full h-32 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="services" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              A few steps on the way to health
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Register</h3>
              <p className="text-gray-600 text-sm">Create your account in minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Book or Instant Consult</h3>
              <p className="text-gray-600 text-sm">Schedule or connect immediately</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Video Consultation</h3>
              <p className="text-gray-600 text-sm">Connect with your doctor</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'hsl(150, 15%, 95%)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Start Your Healthcare Journey Today
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of Jamaicans who trust LifeLink for their healthcare needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-10 py-4 rounded-full bg-blue-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transform transition-all"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-10 py-4 rounded-full bg-white text-gray-900 font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

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

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(3deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

// Telehealth bento card component
const TelehealthCard = () => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-md border border-gray-200">
      {/* Image grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-3">
          <div className="bg-gray-100 rounded-2xl p-4">
            <div className="text-xs text-gray-600 mb-1">Satisfaction</div>
            <div className="text-2xl font-bold text-gray-900">80%</div>
            <div className="text-xs text-gray-600">Successful diagnosis</div>
          </div>
          <div className="bg-blue-100 rounded-2xl p-3 text-gray-900">
            <div className="text-xs font-medium">Well-being</div>
            <div className="text-sm font-semibold mt-1">Mental Health Support</div>
          </div>
        </div>
        <div className="bg-gray-100 rounded-2xl overflow-hidden">
          <Image
            src="/assets/doctor-portrait.png"
            alt="Healthcare"
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Telehealth Solution label */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">Telehealth Solution</h3>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 mt-2 px-4 py-2 rounded-full bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
          >
            Explore <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700">
          About
        </span>
      </div>

      <p className="text-xs text-gray-600">
        Our platform connects you with trusted healthcare professionals.
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-600">A few steps on the way to health</span>
        <div className="flex gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-200" />
          <span className="w-6 h-6 rounded-full bg-blue-400" />
        </div>
      </div>
    </div>
  );
};

export default Home;
