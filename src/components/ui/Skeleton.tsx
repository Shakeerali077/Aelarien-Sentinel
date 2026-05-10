import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      "animate-pulse bg-zinc-800/50 rounded",
      className
    )} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-8 h-4 rounded" />
      </div>
      <Skeleton className="w-3/4 h-6 rounded" />
      <Skeleton className="w-full h-12 rounded-xl" />
      <Skeleton className="w-full h-10 rounded-xl" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 px-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-1/3 h-4" />
            <Skeleton className="w-1/4 h-3" />
          </div>
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
