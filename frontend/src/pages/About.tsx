import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";
import aravindImg from "../assets/Aravind.png";
import shivaImg from "../assets/shivakumar.jpeg";
import adhithyaImg from "../assets/adhithya.jpeg";
import avulampallyImg from "../assets/A.Aravind.jpeg";
export default function About() {
    const { isDark } = useTheme();

    return (
        <div
            className={`min-h-screen px-6 py-16 transition-colors duration-300
        ${isDark ? "bg-cyber-dark text-white" : "bg-white text-gray-900"}`}
        >
            {/* HERO */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-6xl mx-auto text-center mb-20"
            >
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
                    About SocioSphere
                </h1>

                <p
                    className={`mt-6 text-lg leading-relaxed max-w-3xl mx-auto
            ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                    SocioSphere is a next-generation service marketplace designed to bridge
                    the gap between customers and service providers through a seamless,
                    secure, and intelligent digital platform.
                    We integrate real-time communication, secure payments, AI-powered
                    assistance, and a scalable architecture to deliver a futuristic
                    service ecosystem.
                </p>
            </motion.div>

            {/* MISSION */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className={`max-w-6xl mx-auto p-10 rounded-3xl mb-20 border transition-colors
          ${isDark
                        ? "glass-card border-cyber-border"
                        : "glass-card-light border-gray-200"
                    }`}
            >
                <h2 className="text-3xl font-bold mb-4 text-neon-blue">
                    Our Mission
                </h2>

                <p
                    className={`leading-relaxed
            ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                    Our mission is to redefine local service discovery by combining
                    modern web technologies, secure backend infrastructure, real-time
                    interactions, and scalable deployment strategies.
                    SocioSphere empowers communities by creating a reliable digital
                    marketplace built on trust, transparency, and performance.
                </p>
            </motion.div>

            {/* TEAM */}
            <div className="max-w-6xl mx-auto space-y-20">
                <TeamMember
                    name="Shiva Kumar Somineni"
                    role="Backend Developer"
                    image={shivaImg}
                    description="Architected the backend system using secure APIs, database optimization, authentication logic, and scalable server-side architecture ensuring performance and reliability."
                />

                <TeamMember
                    name="Adithya Dasari"
                    role="Frontend Developer"
                    image={adhithyaImg}
                    description="Designed and developed the futuristic cyberpunk user interface using React, TailwindCSS, and advanced animation techniques."
                />

                <TeamMember
                    name="Aravind Mora"
                    role="Testing & QA"
                    image={aravindImg}
                    description="Led system testing, integration validation, and QA processes ensuring reliability and production readiness."
                />

                <TeamMember
                    name="Avulampally Aravind"
                    role="Deployment & Maintenance"
                    image={avulampallyImg}
                    description="Managed cloud deployment, CI/CD pipelines, server configuration, monitoring, and long-term system maintenance."
                />
            </div>
        </div>
    );
}

/* TEAM COMPONENT */

function TeamMember({
    name,
    role,
    image,
    description,
}: {
    name: string;
    role: string;
    image: string;
    description: string;
}) {
    const { isDark } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={`flex flex-col md:flex-row items-center gap-10 p-8 rounded-3xl border transition-colors
        ${isDark
                    ? "glass-card border-cyber-border"
                    : "glass-card-light border-gray-200"
                }`}
        >
            <motion.img
                src={image}
                alt={name}
                whileHover={{ scale: 1.05 }}
                className="w-60 h-60 object-cover rounded-2xl border border-neon-blue"
            />

            <div className="flex-1">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                    {name}
                </h3>

                <p className="text-neon-green font-semibold mt-2">
                    {role}
                </p>

                <p
                    className={`mt-4 leading-relaxed
            ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                    {description}
                </p>
            </div>
        </motion.div>
    );
}