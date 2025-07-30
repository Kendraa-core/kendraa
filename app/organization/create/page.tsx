'use client';

import ComingSoon from '@/components/common/ComingSoon';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

export default function CreateOrganizationPage() {
  return (
    <ComingSoon
      title="Create Organization"
      description="Build your company profile and connect with professionals in your industry."
      icon={BuildingOffice2Icon}
      expectedDate="Q2 2024"
      features={[
        "Company profile creation",
        "Employee management",
        "Job posting capabilities",
        "Analytics and insights",
        "Branded content publishing"
      ]}
    />
  );
} 