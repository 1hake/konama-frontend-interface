'use client';

import React from 'react';

interface SiriOrbProps {
    className?: string;
    size?: number;
    isActive?: boolean;
}

export function SiriOrb({ className = '', size = 120, isActive = true }: SiriOrbProps) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div 
                className="relative"
                style={{ width: size, height: size }}
            >
                {/* Orbe principal */}
                <div
                    className={`absolute inset-0 rounded-full ${
                        isActive 
                            ? 'animate-pulse bg-gradient-to-br from-violet-400 via-indigo-500 to-purple-500' 
                            : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500'
                    }`}
                    style={{
                        animation: isActive ? 'siri-breathe 8s ease-in-out infinite, siri-float 12s ease-in-out infinite' : 'none',
                        filter: 'blur(1px)',
                        opacity: 0.9
                    }}
                />

                {/* Couches d'animation organiques */}
                <div
                    className={`absolute inset-2 rounded-full ${
                        isActive 
                            ? 'bg-gradient-to-br from-orange-300 via-red-400 to-pink-400' 
                            : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600'
                    }`}
                    style={{
                        animation: isActive ? 'siri-morphing 15s ease-in-out infinite' : 'none',
                        filter: 'blur(2px)',
                        opacity: 0.7
                    }}
                />

                <div
                    className={`absolute inset-4 rounded-full ${
                        isActive 
                            ? 'bg-gradient-to-br from-emerald-200 via-cyan-300 to-teal-300' 
                            : 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700'
                    }`}
                    style={{
                        animation: isActive ? 'siri-wobble 18s ease-in-out infinite reverse' : 'none',
                        filter: 'blur(3px)',
                        opacity: 0.5
                    }}
                />

                {/* Centre lumineux */}
                <div
                    className={`absolute inset-8 rounded-full ${
                        isActive 
                            ? 'bg-gradient-to-br from-white via-blue-100 to-purple-100' 
                            : 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400'
                    }`}
                    style={{
                        animation: isActive ? 'siri-glow 6s ease-in-out infinite alternate' : 'none',
                        boxShadow: isActive ? '0 0 30px rgba(99, 102, 241, 0.4)' : 'none'
                    }}
                />

                {/* Particules flottantes */}
                {isActive && (
                    <>
                        <div
                            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
                            style={{
                                top: '20%',
                                left: '30%',
                                animation: 'siri-particle-1 20s linear infinite'
                            }}
                        />
                        <div
                            className="absolute w-0.5 h-0.5 bg-blue-200 rounded-full opacity-60"
                            style={{
                                top: '60%',
                                right: '25%',
                                animation: 'siri-particle-2 16s linear infinite'
                            }}
                        />
                        <div
                            className="absolute w-1.5 h-1.5 bg-purple-200 rounded-full opacity-50"
                            style={{
                                bottom: '30%',
                                left: '20%',
                                animation: 'siri-particle-3 22s linear infinite'
                            }}
                        />
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes siri-breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                }

                @keyframes siri-float {
                    0%, 100% { transform: translateY(0px); }
                    25% { transform: translateY(-3px) translateX(1px); }
                    50% { transform: translateY(-6px) translateX(-1px); }
                    75% { transform: translateY(-3px) translateX(2px); }
                }

                @keyframes siri-morphing {
                    0%, 100% { 
                        transform: scale(1) rotate(0deg);
                        border-radius: 50%;
                    }
                    8% {
                        transform: scale(1.08, 0.92) rotate(22deg);
                        border-radius: 42% 58% 38% 62% / 68% 32% 75% 25%;
                    }
                    16% {
                        transform: scale(1.18, 0.82) rotate(54deg);
                        border-radius: 28% 72% 35% 65% / 45% 55% 68% 32%;
                    }
                    24% {
                        transform: scale(1.25, 0.75) rotate(78deg);
                        border-radius: 18% 82% 25% 75% / 72% 28% 58% 42%;
                    }
                    32% {
                        transform: scale(0.95, 1.05) rotate(112deg);
                        border-radius: 45% 55% 42% 58% / 35% 65% 28% 72%;
                    }
                    40% {
                        transform: scale(0.85, 1.15) rotate(138deg);
                        border-radius: 55% 45% 48% 52% / 25% 75% 42% 58%;
                    }
                    48% {
                        transform: scale(0.78, 1.22) rotate(165deg);
                        border-radius: 38% 62% 32% 68% / 58% 42% 75% 25%;
                    }
                    56% {
                        transform: scale(0.82, 1.18) rotate(198deg);
                        border-radius: 42% 58% 28% 72% / 65% 35% 52% 48%;
                    }
                    64% {
                        transform: scale(0.88, 1.12) rotate(225deg);
                        border-radius: 48% 52% 35% 65% / 72% 28% 45% 55%;
                    }
                    72% {
                        transform: scale(1.02, 0.98) rotate(252deg);
                        border-radius: 35% 65% 45% 55% / 55% 45% 38% 62%;
                    }
                    80% {
                        transform: scale(1.15, 0.85) rotate(285deg);
                        border-radius: 25% 75% 52% 48% / 42% 58% 68% 32%;
                    }
                    88% {
                        transform: scale(1.12, 0.88) rotate(318deg);
                        border-radius: 38% 62% 48% 52% / 48% 52% 58% 42%;
                    }
                    96% {
                        transform: scale(1.05, 0.95) rotate(348deg);
                        border-radius: 45% 55% 42% 58% / 55% 45% 48% 52%;
                    }
                }

                @keyframes siri-wobble {
                    0%, 100% { 
                        transform: rotate(0deg) scale(1);
                        border-radius: 50%;
                    }
                    7% { 
                        transform: rotate(2deg) scale(1.06);
                        border-radius: 48% 52% 42% 58% / 58% 42% 65% 35%;
                    }
                    14% { 
                        transform: rotate(4deg) scale(1.14);
                        border-radius: 35% 65% 32% 68% / 72% 28% 58% 42%;
                    }
                    21% { 
                        transform: rotate(6deg) scale(1.22);
                        border-radius: 28% 72% 38% 62% / 45% 55% 72% 28%;
                    }
                    28% { 
                        transform: rotate(3deg) scale(1.16);
                        border-radius: 42% 58% 45% 55% / 62% 38% 55% 45%;
                    }
                    35% { 
                        transform: rotate(-1deg) scale(0.94);
                        border-radius: 55% 45% 52% 48% / 38% 62% 42% 58%;
                    }
                    42% { 
                        transform: rotate(-4deg) scale(0.86);
                        border-radius: 62% 38% 58% 42% / 32% 68% 38% 62%;
                    }
                    49% { 
                        transform: rotate(-6deg) scale(0.82);
                        border-radius: 68% 32% 62% 38% / 28% 72% 45% 55%;
                    }
                    56% { 
                        transform: rotate(-5deg) scale(0.88);
                        border-radius: 58% 42% 55% 45% / 35% 65% 52% 48%;
                    }
                    63% { 
                        transform: rotate(-2deg) scale(0.96);
                        border-radius: 52% 48% 48% 52% / 42% 58% 58% 42%;
                    }
                    70% {
                        transform: rotate(1deg) scale(1.08);
                        border-radius: 45% 55% 42% 58% / 55% 45% 62% 38%;
                    }
                    77% {
                        transform: rotate(3deg) scale(1.12);
                        border-radius: 38% 62% 35% 65% / 62% 38% 68% 32%;
                    }
                    84% {
                        transform: rotate(5deg) scale(1.18);
                        border-radius: 32% 68% 42% 58% / 68% 32% 55% 45%;
                    }
                    91% {
                        transform: rotate(2deg) scale(1.04);
                        border-radius: 45% 55% 48% 52% / 52% 48% 58% 42%;
                    }
                    98% {
                        transform: rotate(1deg) scale(1.01);
                        border-radius: 48% 52% 46% 54% / 54% 46% 52% 48%;
                    }
                }

                @keyframes siri-glow {
                    0% { 
                        opacity: 0.7;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.85;
                        transform: scale(1.15);
                    }
                    100% { 
                        opacity: 1;
                        transform: scale(1.25);
                    }
                }

                @keyframes siri-particle-1 {
                    0% { transform: translate(0, 0) scale(0); opacity: 0; }
                    5% { opacity: 0.8; }
                    25% { transform: translate(10px, -15px) scale(1); opacity: 0.7; }
                    50% { transform: translate(20px, -30px) scale(0.8); opacity: 0.5; }
                    75% { transform: translate(30px, -45px) scale(0.6); opacity: 0.3; }
                    95% { opacity: 0.1; }
                    100% { transform: translate(40px, -60px) scale(0); opacity: 0; }
                }

                @keyframes siri-particle-2 {
                    0% { transform: translate(0, 0) scale(0); opacity: 0; }
                    8% { opacity: 0.6; }
                    30% { transform: translate(-12px, -10px) scale(1); opacity: 0.5; }
                    55% { transform: translate(-25px, -20px) scale(0.7); opacity: 0.4; }
                    80% { transform: translate(-38px, -30px) scale(0.5); opacity: 0.2; }
                    92% { opacity: 0.1; }
                    100% { transform: translate(-50px, -40px) scale(0); opacity: 0; }
                }

                @keyframes siri-particle-3 {
                    0% { transform: translate(0, 0) scale(0); opacity: 0; }
                    10% { opacity: 0.5; }
                    35% { transform: translate(8px, -18px) scale(1); opacity: 0.4; }
                    60% { transform: translate(15px, -35px) scale(0.8); opacity: 0.3; }
                    85% { transform: translate(22px, -52px) scale(0.6); opacity: 0.15; }
                    90% { opacity: 0.1; }
                    100% { transform: translate(30px, -70px) scale(0); opacity: 0; }
                }
            `}</style>
        </div>
    );
}