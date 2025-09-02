'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  // Visual Accessibility
  high_contrast: boolean;
  font_size: 'small' | 'medium' | 'large' | 'extra_large';
  reduce_motion: boolean;
  focus_indicators: boolean;
  
  // Audio Accessibility
  screen_reader_enabled: boolean;
  audio_descriptions: boolean;
  voice_navigation: boolean;
  sound_notifications: boolean;
  
  // Motor Accessibility
  keyboard_navigation: boolean;
  mouse_alternatives: boolean;
  sticky_keys: boolean;
  slow_keys: boolean;
  
  // Cognitive Accessibility
  simplified_interface: boolean;
  auto_scroll_disable: boolean;
  timeout_extensions: boolean;
  reading_assistance: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  isHighContrast: boolean;
  fontSize: string;
  isReducedMotion: boolean;
}

const defaultSettings: AccessibilitySettings = {
  high_contrast: false,
  font_size: 'medium',
  reduce_motion: false,
  focus_indicators: true,
  screen_reader_enabled: false,
  audio_descriptions: false,
  voice_navigation: false,
  sound_notifications: true,
  keyboard_navigation: true,
  mouse_alternatives: false,
  sticky_keys: false,
  slow_keys: false,
  simplified_interface: false,
  auto_scroll_disable: false,
  timeout_extensions: false,
  reading_assistance: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('<span className="mulish-semibold">kendraa</span>_accessibility_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }

    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      setSettings(prev => ({
        ...prev,
        reduce_motion: prefersReducedMotion,
        high_contrast: prefersHighContrast,
      }));
    }

    // Create screen reader announcer
    const announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.className = 'sr-only';
    announcerElement.id = 'accessibility-announcer';
    document.body.appendChild(announcerElement);
    setAnnouncer(announcerElement);

    return () => {
      if (announcerElement.parentNode) {
        announcerElement.parentNode.removeChild(announcerElement);
      }
    };
  }, []);

  useEffect(() => {
    // Save settings to localStorage
          localStorage.setItem('<span className="mulish-semibold">kendraa</span>_accessibility_settings', JSON.stringify(settings));

    // Apply CSS custom properties for accessibility
    const root = document.documentElement;
    
    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      extra_large: '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.font_size]);

    // High contrast
    if (settings.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reduce_motion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Focus indicators
    if (settings.focus_indicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

  }, [settings]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcer && settings.screen_reader_enabled) {
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;
      
      // Clear after a delay to ensure it can be re-announced
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  };

  const getFontSizeClass = () => {
    switch (settings.font_size) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'extra_large': return 'text-xl';
      default: return 'text-base';
    }
  };

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    announceToScreenReader,
    isHighContrast: settings.high_contrast,
    fontSize: getFontSizeClass(),
    isReducedMotion: settings.reduce_motion,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      <div className={`
        ${settings.high_contrast ? 'accessibility-high-contrast' : ''}
        ${settings.reduce_motion ? 'accessibility-reduce-motion' : ''}
        ${settings.simplified_interface ? 'accessibility-simplified' : ''}
        ${getFontSizeClass()}
      `}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Accessibility Settings Panel Component
export function AccessibilitySettingsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { settings, updateSettings, announceToScreenReader } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Accessibility Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Close accessibility settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Visual Settings */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Visual Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">High Contrast Mode</label>
                  <p className="text-sm text-gray-600">Increases color contrast for better visibility</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.high_contrast}
                  onChange={(e) => {
                    updateSettings({ high_contrast: e.target.checked });
                    announceToScreenReader(
                      `High contrast mode ${e.target.checked ? 'enabled' : 'disabled'}`
                    );
                  }}
                  className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-medium block mb-2">Font Size</label>
                <select
                  value={settings.font_size}
                  onChange={(e) => {
                    const newSize = e.target.value as AccessibilitySettings['font_size'];
                    updateSettings({ font_size: newSize });
                    announceToScreenReader(`Font size changed to ${newSize}`);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra_large">Extra Large</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Reduce Motion</label>
                  <p className="text-sm text-gray-600">Minimizes animations and transitions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reduce_motion}
                  onChange={(e) => {
                    updateSettings({ reduce_motion: e.target.checked });
                    announceToScreenReader(
                      `Motion reduction ${e.target.checked ? 'enabled' : 'disabled'}`
                    );
                  }}
                  className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Enhanced Focus Indicators</label>
                  <p className="text-sm text-gray-600">Makes keyboard focus more visible</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.focus_indicators}
                  onChange={(e) => updateSettings({ focus_indicators: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Audio Settings */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Audio & Screen Reader</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Screen Reader Support</label>
                  <p className="text-sm text-gray-600">Enhanced compatibility with screen readers</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.screen_reader_enabled}
                  onChange={(e) => updateSettings({ screen_reader_enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Audio Descriptions</label>
                  <p className="text-sm text-gray-600">Provides audio descriptions for visual content</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.audio_descriptions}
                  onChange={(e) => updateSettings({ audio_descriptions: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Voice Navigation</label>
                  <p className="text-sm text-gray-600">Control the app using voice commands</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.voice_navigation}
                  onChange={(e) => updateSettings({ voice_navigation: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Cognitive Settings */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Cognitive Support</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Simplified Interface</label>
                  <p className="text-sm text-gray-600">Reduces visual complexity and distractions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.simplified_interface}
                  onChange={(e) => updateSettings({ simplified_interface: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Reading Assistance</label>
                  <p className="text-sm text-gray-600">Highlights text and provides reading aids</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reading_assistance}
                  onChange={(e) => updateSettings({ reading_assistance: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Extended Timeouts</label>
                  <p className="text-sm text-gray-600">Provides more time for interactions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.timeout_extensions}
                  onChange={(e) => updateSettings({ timeout_extensions: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={() => updateSettings(defaultSettings)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 font-medium focus:outline-none focus:ring-2 focus:ring-azure-500"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
