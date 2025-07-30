'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  RocketLaunchIcon,
  BellIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  expectedDate?: string;
  features?: string[];
  notifyMe?: boolean;
}

export default function ComingSoon({
  title,
  description,
  icon: Icon = RocketLaunchIcon,
  expectedDate,
  features,
  notifyMe = true,
}: ComingSoonProps) {
  const router = useRouter();

  const handleNotifyMe = () => {
    // This would integrate with a notification service
    alert('We\'ll notify you when this feature is available!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardContent className="p-12 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-linkedin-light rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <Icon className="w-10 h-10 text-linkedin-primary" />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="text-lg text-gray-600 max-w-lg mx-auto">{description}</p>
              </div>

              {expectedDate && (
                <div className="inline-flex items-center px-4 py-2 bg-linkedin-light rounded-full">
                  <span className="text-sm font-medium text-linkedin-primary">
                    Expected: {expectedDate}
                  </span>
                </div>
              )}

              {features && features.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
                  <h3 className="font-semibold text-gray-900 mb-4 text-center">What to expect:</h3>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center text-sm text-gray-700"
                      >
                        <div className="w-2 h-2 bg-linkedin-primary rounded-full mr-3 flex-shrink-0" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                {notifyMe && (
                  <Button onClick={handleNotifyMe} className="flex items-center">
                    <BellIcon className="w-4 h-4 mr-2" />
                    Notify me when ready
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="flex items-center"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Go back
                </Button>
              </div>

              {/* Progress */}
              <div className="pt-8">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Development Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                    className="bg-linkedin-primary h-2 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500 mb-4">Meanwhile, explore these features:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/feed">
              <Button variant="ghost" size="sm">Feed</Button>
            </Link>
            <Link href="/network">
              <Button variant="ghost" size="sm">Network</Button>
            </Link>
            <Link href="/profile/setup">
              <Button variant="ghost" size="sm">Profile</Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Preset configurations for common features
export const MessagingComingSoon = () => (
  <ComingSoon
    title="Messaging"
    description="Connect and chat with your professional network in real-time."
    expectedDate="Q2 2024"
    features={[
      "Real-time messaging",
      "Group conversations",
      "File sharing",
      "Message reactions",
      "Video calls integration"
    ]}
  />
);

export const JobsComingSoon = () => (
  <ComingSoon
    title="Jobs"
    description="Discover exciting career opportunities tailored to your skills and interests."
    expectedDate="Q1 2024"
    features={[
      "Personalized job recommendations",
      "Easy application process",
      "Salary insights",
      "Company reviews",
      "Interview preparation"
    ]}
  />
);

export const LearningComingSoon = () => (
  <ComingSoon
    title="Learning"
    description="Enhance your skills with curated courses and learning paths."
    expectedDate="Q3 2024"
    features={[
      "Expert-led courses",
      "Interactive learning paths",
      "Skill assessments",
      "Certificates of completion",
      "Learning recommendations"
    ]}
  />
); 