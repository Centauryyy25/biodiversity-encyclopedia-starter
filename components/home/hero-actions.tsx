'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Leaf, BookOpen, Users } from 'lucide-react';

const actions = [
  {
    label: 'Explore Species',
    description: 'Jump straight into the full catalog.',
    icon: Leaf,
    variant: 'default' as const,
    targetId: 'featured-species',
    fallbackHref: '/species',
  },
  {
    label: 'Learn & Discover',
    description: 'Guides, quizzes, and curated lessons.',
    icon: BookOpen,
    variant: 'outline' as const,
    targetId: 'learn',
    fallbackHref: '/#learn',
  },
  {
    label: 'Contribute',
    description: 'Share your observations with the community.',
    icon: Users,
    variant: 'outline' as const,
    targetId: 'contribute',
    fallbackHref: '/#contribute',
  },
];

export default function HeroActions() {
  const router = useRouter();

  const handleAction = useCallback(
    (action: (typeof actions)[number]) => {
      let handled = false;

      if (action.targetId && typeof window !== 'undefined') {
        const target = document.getElementById(action.targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          handled = true;
        }
      }

      if (!handled && action.fallbackHref) {
        router.push(action.fallbackHref);
      }
    },
    [router],
  );

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            size="lg"
            variant={action.variant}
            onClick={() => handleAction(action)}
            className={
              action.variant === 'default'
                ? 'bg-[#8EB69B] text-[#051F20] hover:bg-[#DAF1DE]'
                : 'bg-[#8EB69B] text-[#051F20] hover:bg-[#DAF1DE]'
            }
          >
            <Icon className="mr-2 h-5 w-5" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
