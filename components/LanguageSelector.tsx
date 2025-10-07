import React, { useState, useMemo } from 'react';
import { LANGUAGES } from '../languages';

interface LanguageSelectorProps {
  onSelectLanguage: (language: string) => void;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
    </svg>
);


const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelectLanguage }) => {
  const [query, setQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    if (query.trim() === '') {
      return [];
    }
    const lowerCaseQuery = query.toLowerCase();
    return LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(lowerCaseQuery) ||
        lang.nativeName.toLowerCase().includes(lowerCaseQuery)
    ).slice(0, 100); // Limit results for performance
  }, [query]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to LinguaMaster AI!</h1>
          <p className="text-lg text-gray-600">Find your native language to get started.</p>
        </div>

        <div className="relative mb-4 animate-fade-in-up">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
             <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for your language (e.g., Spanish, Español)"
            className="block w-full rounded-md border-0 bg-white py-3 pl-10 pr-3 text-gray-900 shadow-md ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-shadow"
            aria-label="Search for a language"
            autoFocus
          />
        </div>

        <div className="overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-gray-200 animate-fade-in-up" style={{ animationDelay: `100ms` }}>
            <ul role="listbox" className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => (
                  <li
                    key={lang.name}
                    onClick={() => onSelectLanguage(lang.name)}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-100"
                    role="option"
                    aria-selected="false"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectLanguage(lang.name)
                        }
                    }}
                  >
                    <span className="text-sm font-medium text-gray-900">{lang.name}</span>
                    <span className="text-sm text-gray-500">{lang.nativeName}</span>
                  </li>
                ))
              ) : (
                query.trim() !== '' && (
                  <li className="p-4 text-center text-sm text-gray-500">
                    No languages found.
                  </li>
                )
              )}
            </ul>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
           opacity: 0;
           animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;
