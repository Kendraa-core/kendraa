'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircleIcon, PlusIcon } from '@heroicons/react/24/outline';

interface PeopleCardProps {
  name: string;
  title: string;
  imageSrc?: string;
}

const PeopleCard = ({ name, title, imageSrc = '' }: PeopleCardProps) => (
  <div className="flex items-start space-x-3 mb-4">
    {imageSrc ? (
      <Image
        src={imageSrc}
        alt={name}
        width={48}
        height={48}
        className="rounded-full"
      />
    ) : (
      <UserCircleIcon className="h-12 w-12 text-gray-400" />
    )}
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-gray-900 truncate">{name}</h4>
      <p className="text-xs text-gray-500 truncate">{title}</p>
      <button className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
        Connect
      </button>
    </div>
  </div>
);

export default function RightSidebar() {
  const people = [
    { name: 'Steve Jobs', title: 'CEO of Apple' },
    { name: 'Ryan Roslansky', title: 'CEO of LinkedIn' },
    { name: 'Dylan Field', title: 'CEO of Figma' },
  ];

  return (
    <div className="space-y-4">
      {/* Premium Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-base font-medium">Try Premium for free</h3>
          <p className="text-sm text-gray-500 mt-1">One month free</p>
          <div className="relative h-32 w-full my-4">
            <Image
              src="/premium-illustration.svg"
              alt="Premium features"
              fill
              className="object-contain"
            />
          </div>
          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-3 font-medium hover:opacity-90 transition-opacity">
            Try free
          </button>
        </div>
      </div>

      {/* People You May Know */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium mb-4">People you may know:</h3>
        <div>
          {people.map((person) => (
            <PeopleCard key={person.name} {...person} />
          ))}
          <Link 
            href="/network" 
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mt-2"
          >
            See all
          </Link>
        </div>
      </div>

      {/* Add Pages Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Image
              src="/ux-design.svg"
              alt="UX Design"
              width={24}
              height={24}
              className="mr-2"
            />
            <h3 className="text-sm font-medium">UX Design</h3>
          </div>
          <span className="text-xs text-gray-500">+99</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/ui-design.svg"
              alt="UI Design"
              width={24}
              height={24}
              className="mr-2"
            />
            <h3 className="text-sm font-medium">UI Design</h3>
          </div>
          <span className="text-xs text-red-500">+99</span>
        </div>
        <button className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
          <PlusIcon className="h-4 w-4" />
          Add new page
        </button>
      </div>
    </div>
  );
} 