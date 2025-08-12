import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppSettings } from '../types';

const Settings: React.FC = () => {
    const [settings, setSettings] = useLocalStorage<AppSettings>('app_settings', {
        companyName: 'EHS Integral Management',
        companyAddress: '123 Safety Avenue, Compliance City, 12345',
        companyPhone: '(555) 123-4567',
        companyLogo: '',
    });

    const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
    const [feedback, setFeedback] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempSettings(prev => ({ ...prev, companyLogo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTempSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSettings(tempSettings);
        setFeedback('Configuración guardada exitosamente.');
        setTimeout(() => setFeedback(''), 3000); // Clear feedback after 3 seconds
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-dark-text mb-6">Configuración General del Sistema</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Form Fields */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                            <input type="text" id="companyName" name="companyName" value={tempSettings.companyName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                        </div>
                         <div>
                            <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input type="tel" id="companyPhone" name="companyPhone" value={tempSettings.companyPhone} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">Dirección</label>
                            <textarea id="companyAddress" name="companyAddress" value={tempSettings.companyAddress} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                       
                    </div>

                    {/* Right Column: Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Logotipo de la Empresa</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {tempSettings.companyLogo ? (
                                    <img src={tempSettings.companyLogo} alt="Logo Preview" className="mx-auto h-24 w-auto" />
                                ) : (
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="companyLogo" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                        <span>Subir un archivo</span>
                                        <input id="companyLogo" name="companyLogo" type="file" className="sr-only" accept="image/png, image/jpeg, image/svg+xml" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">o arrastrar y soltar</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, SVG hasta 500KB</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer: Save Button */}
                <div className="pt-5">
                    <div className="flex justify-end items-center">
                        {feedback && <p className="text-sm text-green-600 mr-4">{feedback}</p>}
                        <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Settings;
