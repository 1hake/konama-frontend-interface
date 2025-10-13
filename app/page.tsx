'use client'

import { useState } from 'react';
import Image from 'next/image';
import emailjs from '@emailjs/browser';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    deviceType: ''
  });

  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    isSubmitted: false,
    error: null as string | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate device type selection
    if (!formData.deviceType) {
      setFormStatus({
        isSubmitting: false,
        isSubmitted: false,
        error: 'Veuillez sélectionner un type d\'appareil'
      });
      return;
    }

    setFormStatus({ isSubmitting: true, isSubmitted: false, error: null });

    try {
      // Configuration EmailJS - Remplacez par vos propres IDs
      const serviceId = 'service_rg4fqq8';
      const templateId = 'template_97qwpmr';
      const publicKey = 'O2T7uHij3IIhGfLUW';

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        device_type: formData.deviceType,
        message: `Demande de réparation pour: ${formData.deviceType}`
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setFormStatus({ isSubmitting: false, isSubmitted: true, error: null });
      // Reset form
      setFormData({ name: '', email: '', deviceType: '' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      setFormStatus({
        isSubmitting: false,
        isSubmitted: false,
        error: 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pb-12">
      {/* Hero Section */}
      <section className="container mx-auto px-6">
        <div className="text-center">
          <div className='pt-12'>

            {formStatus.isSubmitted ? (
              <>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Merci !
                  <span className="block text-green-400">On vous rappelle</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto ">
                  Votre demande a été envoyée avec succès
                </p>
              </>
            ) : (
              <>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  J&apos;ai tout
                  <span className="block text-blue-400">perdu..</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                  Ton appareil ne s&apos;allume plus ou n&apos;apparaît pas ? <br />
                  <span className="text-blue-400">On récupère tes données !</span>
                </p>
              </>
            )}
          </div>

          {/* Hero Image */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <Image
                  src={formStatus.isSubmitted ? "/images/smile.png" : "/images/crying.png"}
                  alt={formStatus.isSubmitted ? "Demande envoyée avec succès" : "Besoin d'aide pour récupérer vos données"}
                  width={800}
                  height={600}
                  className=" lg:translate-y-16 translate-y-8 md:translate-y-14 z-10"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8">
            {formStatus.isSubmitted ? (
              // Vue de succès
              <div className="text-center">

                <h2 className="text-3xl font-bold text-green-400 mb-4">
                  Message envoyé !
                </h2>
                <p className="text-lg text-gray-300 mb-6">
                  Nous vous contactons très vite pour la récupération de données de votre {formData.deviceType || 'appareil'}.
                </p>
                <button
                  onClick={() => setFormStatus({ isSubmitting: false, isSubmitted: false, error: null })}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Envoyer une nouvelle demande
                </button>
              </div>
            ) : (
              // Formulaire normal
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Affichage des erreurs */}
                {formStatus.error && (
                  <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded-lg">
                    {formStatus.error}
                  </div>
                )}

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={formStatus.isSubmitting}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Entrez votre nom complet"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={formStatus.isSubmitting}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Entrez votre adresse email"
                  />
                </div>

                {/* Device Type Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Type d&apos;appareil pour récupération de données
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'Disque dur (HDD/SSD)', emoji: '💽', label: 'Disque dur' },
                      { value: 'Clé USB', emoji: '🔌', label: 'Clé USB' },
                      { value: 'Carte SD', emoji: '💾', label: 'Carte SD' },
                      { value: 'Carte mémoire', emoji: '📱', label: 'Carte mémoire' }
                    ].map((device) => (
                      <button
                        key={device.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, deviceType: device.value })}
                        disabled={formStatus.isSubmitting}
                        className={`
                          relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                          ${formData.deviceType === device.value
                            ? 'border-blue-500 bg-blue-900/30 ring-2 ring-blue-700'
                            : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        `}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{device.emoji}</div>
                          <div className={`font-medium text-sm ${formData.deviceType === device.value
                            ? 'text-blue-300'
                            : 'text-gray-300'
                            }`}>
                            {device.label}
                          </div>
                        </div>
                        {formData.deviceType === device.value && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {!formData.deviceType && (
                    <p className="text-sm text-red-500 mt-2">Veuillez sélectionner un type d&apos;appareil</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formStatus.isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-150 ease-out disabled:cursor-not-allowed flex items-center justify-center active:scale-[0.98]"
                >
                  {formStatus.isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                      Envoi en cours
                    </>
                  ) : (
                    'Envoyer ma demande'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
