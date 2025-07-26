'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import type { Organization } from '@/types/database.types';

const organizationTypes = [
  { id: 'company', label: 'Company', icon: BuildingOfficeIcon },
  { id: 'hospital', label: 'Hospital', icon: BuildingOfficeIcon },
  { id: 'educational', label: 'Educational Institution', icon: BuildingOfficeIcon },
];

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5001-10000 employees',
  '10001+ employees',
];

export default function CreateOrganizationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Organization>>({
    name: '',
    type: 'company',
    industry: '',
    size: '',
    description: '',
    website: '',
    headquarters: '',
    founded_year: undefined,
    specialties: [],
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [newSpecialty, setNewSpecialty] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoFile(file);
          setLogoPreview(reader.result as string);
        } else {
          setCoverFile(file);
          setCoverPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpecialtyAdd = () => {
    if (newSpecialty.trim() && !formData.specialties?.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), newSpecialty.trim()],
      }));
      setNewSpecialty('');
    }
  };

  const handleSpecialtyRemove = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties?.filter(s => s !== specialty),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      let logoUrl = null;
      let coverUrl = null;

      // Upload logo if provided
      if (logoFile) {
        const logoExt = logoFile.name.split('.').pop();
        const logoPath = `organizations/logos/${Date.now()}.${logoExt}`;
        const { error: logoError } = await supabase.storage
          .from('public')
          .upload(logoPath, logoFile);

        if (logoError) throw logoError;
        const { data: { publicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(logoPath);
        logoUrl = publicUrl;
      }

      // Upload cover if provided
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `organizations/covers/${Date.now()}.${coverExt}`;
        const { error: coverError } = await supabase.storage
          .from('public')
          .upload(coverPath, coverFile);

        if (coverError) throw coverError;
        const { data: { publicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(coverPath);
        coverUrl = publicUrl;
      }

      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          ...formData,
          logo_url: logoUrl,
          cover_url: coverUrl,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add creator as owner
      const { error: adminError } = await supabase
        .from('organization_admins')
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          role: 'owner',
        });

      if (adminError) throw adminError;

      router.push(`/organization/${organization.id}`);
    } catch (error) {
      console.error('Error creating organization:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900">Create an Organization Page</h1>
            <p className="mt-2 text-gray-600">
              Create a page for your company, hospital, or educational institution.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              {/* Logo & Cover */}
              <div className="space-y-6">
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Photo
                  </label>
                  <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                    {coverPreview ? (
                      <Image
                        src={coverPreview}
                        alt="Cover"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Change Cover
                    </button>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={e => handleImageChange(e, 'cover')}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                        {logoPreview ? (
                          <Image
                            src={logoPreview}
                            alt="Logo"
                            width={128}
                            height={128}
                            className="object-cover"
                          />
                        ) : (
                          <BuildingOfficeIcon className="w-full h-full p-6 text-gray-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PhotoIcon className="w-5 h-5" />
                      </button>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageChange(e, 'logo')}
                        className="hidden"
                      />
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Organization name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {organizationTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.id as Organization['type'] }))}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        formData.type === type.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g. Healthcare, Education"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Size
                  </label>
                  <select
                    value={formData.size}
                    onChange={e => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select size</option>
                    {companySizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headquarters
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.headquarters}
                      onChange={e => setFormData(prev => ({ ...prev, headquarters: e.target.value }))}
                      placeholder="City, Country"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Founded
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.founded_year}
                      onChange={e => setFormData(prev => ({ ...prev, founded_year: parseInt(e.target.value) }))}
                      placeholder="Year"
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell people about your organization..."
                />
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialties
                </label>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.specialties?.map((specialty, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                      >
                        {specialty}
                        <button
                          type="button"
                          onClick={() => handleSpecialtyRemove(specialty)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={newSpecialty}
                        onChange={e => setNewSpecialty(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleSpecialtyAdd())}
                        placeholder="Add a specialty"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSpecialtyAdd}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Organization'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 