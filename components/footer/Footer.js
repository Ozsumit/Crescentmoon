import React from "react";
import Link from "next/link";
import {
  Github,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Mail,
  Heart,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com/ozsumit",
      label: "GitHub",
    },

    {
      icon: Instagram,
      href: "https://instagram.com/sumitp0khrel",
      label: "Instagram",
    },
    {
      icon: Facebook,
      href: "https://facebook.com/ozsumit",
      label: "Facebook",
    },
  ];

  const footerLinks = [
    { href: "/", label: "Home" },
    { href: "/movies", label: "Movies" },
    { href: "/series", label: "TV Series" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-4 mt-10">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="group">
              <span
                className="text-white font-bold text-2xl tracking-wide 
                group-hover:text-blue-400 transition-colors flex items-center"
              >
                Crescent Moon
                <Heart
                  className="ml-2 text-red-500 group-hover:scale-110 transition-transform"
                  size={24}
                />
              </span>
            </Link>
            <p className="text-sm mt-2 text-center md:text-left">
              When you are wannin' more entertainment
            </p>

            {/* Newsletter Signup */}
            <div className="mt-4 w-full max-w-xs">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Subscribe to our newsletter"
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
                  <Mail size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center">
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <nav>
              <ul className="space-y-2 text-center">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white hover:underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center">
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="w-6 h-6 group-hover:scale-110 group-hover:text-blue-400 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright and Additional Info */}
        <div className="mt-8 pt-4 border-t border-gray-700 text-center flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-2 md:mb-0">
            &copy; {currentYear} Vass.inc. All rights reserved.
          </p>
          <div className="text-sm space-x-4">
            <Link href="/privacy" className="hover:text-white hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
